import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import catchAsync from '@utils/catchAsync';
import User from '@models/userModel';
import sendConfirmationCodeEmail from '@utils/email';
import AppError from '@errors/AppError';
import {
  isCorrectVerificationCode,
  createTokens,
  validateBeforeLogin,
  verifyReCaptcha,
  createOAuthUser,
} from '@services/authService';
import { IReCaptchaResponse } from '@base/types/recaptchaResponse';
import { ObjectId } from 'mongoose';

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phoneNumber, password, passwordConfirm, recaptchaResponse } =
      req.body;

    const reCaptchaMessageResponse: IReCaptchaResponse =
      await verifyReCaptcha(recaptchaResponse);

    if (reCaptchaMessageResponse.response === 400)
      return next(new AppError(reCaptchaMessageResponse.message, 400));

    await User.create({
      email,
      phoneNumber,
      password,
      passwordConfirm,
    });

    res.status(201).json({
      status: 'success',
      message: `${reCaptchaMessageResponse.message} and User is created successfuly. Please verify your account`,
      data: {},
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return next(
        new AppError('No user is found with this email address', 400)
      );

    const message: string = await validateBeforeLogin(email, password);
    if (message !== 'validated') return next(new AppError(message, 400));

    createTokens(user._id as ObjectId, req);

    res.status(200).json({
      status: 'success',
      message: 'logged in successfully',
      data: {
        user,
        sessionId: req.sessionID,
      },
    });
  }
);

export const sendConfirmationCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return next(
        new AppError(
          'please register first to be able to verify your email!',
          400
        )
      );

    if (user.accountStatus !== 'unverified')
      return next(new AppError('your account is already verified!', 400));

    if (
      user.emailVerificationCodeExpires &&
      Date.now() < user.emailVerificationCodeExpires
    )
      return next(
        new AppError(
          'A verification email is already sent, you can ask for another after this one expires',
          400
        )
      );

    const verificationCode = user.generateSaveConfirmationCode();
    await user.save({ validateBeforeSave: false });
    await sendConfirmationCodeEmail(user, verificationCode);

    res.status(200).json({
      status: 'success',
      message: 'verification email sent',
      data: {},
    });
  }
);

export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, verificationCode } = req.body;
    const user = await User.findOne({ email });

    if (!user) return next(new AppError('Provide your email', 400));
    if (!verificationCode)
      return next(new AppError('provide your verification code', 400));

    const verified: boolean = await isCorrectVerificationCode(
      user,
      verificationCode
    );
    if (!verified)
      return next(new AppError('verification code is not correct', 400));

    createTokens(user._id as ObjectId, req);
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    user.accountStatus = 'active';
    user.save();

    res.status(200).json({
      status: 'success',
      message: 'Account got verified successfully',
      data: {
        user,
        sessionId: req.sessionID,
      },
    });
  }
);

export const oAuthCallback = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    createTokens(req.user._id as ObjectId, req);

    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: {
        user: req.user,
        sessionId: req.sessionID,
      },
    });
  }
);

export const googleLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        params: {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: 'postmessage',
          grant_type: 'authorization_code',
        },
      }
    );

    if (!tokenResponse.data.accessToken) {
      return next(new AppError('Failed to get access token from Google', 400));
    }

    const profile = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenResponse.data.accessToken}` },
      }
    );

    const peopleResponse = await axios.get(
      'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
      {
        headers: { Authorization: `Bearer ${tokenResponse.data.accessToken}` },
      }
    );
    const phoneNumber = peopleResponse.data.phoneNumbers
      ? peopleResponse.data.phoneNumbers[0].value
      : undefined;

    console.log(profile.data);
    const user = await createOAuthUser(profile.data, { phoneNumber });

    createTokens(user._id as ObjectId, req);

    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: {
        user,
        sessionId: req.sessionID,
      },
    });
  }
);

export const githubLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/accessToken',
      {
        params: {
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
        },
        headers: { Accept: 'application/json' },
      }
    );

    if (!tokenResponse.data.accessToken) {
      return next(new AppError('Failed to get access token from GitHub', 400));
    }

    const profile = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenResponse.data.accessToken}` },
    });

    const emailResponse = await axios.get(
      'https://api.github.com/user/emails',
      {
        headers: {
          Authorization: `token ${tokenResponse.data.accessToken}`,
        },
      }
    );
    const email = emailResponse.data.find(
      (em: any) => em.primary && em.verified
    )?.email;

    console.log(profile.data);
    const user = await createOAuthUser(profile.data, { email });

    createTokens(user._id as ObjectId, req);

    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: {
        user,
        sessionId: req.sessionID,
      },
    });
  }
);

export const facebookLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;
    const tokenResponse = await axios.get(
      'https://graph.facebook.com/v12.0/oauth/access_token',
      {
        params: {
          client_id: process.env.FACEBOOK_CLIENT_ID,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET,
          code,
        },
      }
    );

    if (!tokenResponse.data.accessToken) {
      return next(
        new AppError('Failed to get access token from Facebook', 400)
      );
    }

    const profile = await axios.get('https://graph.facebook.com/me', {
      params: {
        access_token: tokenResponse.data.accessToken,
      },
    });

    console.log(profile.data);
    const user = await createOAuthUser(profile.data, {});

    createTokens(user._id as ObjectId, req);

    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: {
        user,
        sessionId: req.sessionID,
      },
    });
  }
);

export const refresh = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.session;
    if (!refreshToken)
      return next(new AppError('Please provide a valid refresh token', 400));

    createTokens(req.session.user._id as ObjectId, req, false);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: null,
    });
  }
);

export const isLoggedIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
      message: 'User is logged in',
      data: null,
    });
  }
);
