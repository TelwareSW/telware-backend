import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import catchAsync from '@utils/catchAsync';
import User from '@models/userModel';
import AppError from '@errors/AppError';
import {
  isCorrectVerificationCode,
  createTokens,
  validateBeforeLogin,
  sendEmailVerificationCode,
  verifyReCaptcha,
  generateUsername,
  createOAuthUser,
  sendResetPasswordEmail,
} from '@services/authService';
import { IReCaptchaResponse } from '@base/types/recaptchaResponse';
import { ObjectId } from 'mongoose';
import IUser from '@base/types/user';

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phoneNumber, password, passwordConfirm, recaptchaResponse } =
      req.body;

    const reCaptchaMessageResponse: IReCaptchaResponse =
      await verifyReCaptcha(recaptchaResponse);

    if (reCaptchaMessageResponse.response === 400)
      return next(new AppError(reCaptchaMessageResponse.message, 400));

    const username: string = await generateUsername();

    const user: IUser = await User.create({
      email,
      username,
      phoneNumber,
      password,
      passwordConfirm,
    });

    const errorState = { errorCaught: true };
    await sendEmailVerificationCode(user, next, errorState);
    if (errorState.errorCaught) return;
    return res.status(200).json({
      status: 'success',
      message: 'Verification email sent',
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
    const user: IUser = (await User.findOne({ email })) as IUser;
    const errorState = { errorCaught: true };
    sendEmailVerificationCode(user, next, errorState);
    if (errorState.errorCaught) return;
    return res.status(200).json({
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
        fields: 'id,name,email,picture',
        access_token: tokenResponse.data.accessToken,
      },
    });

    console.log(profile.data);
    const user = await createOAuthUser(profile.data, {
      email: profile.data.email,
      photo: profile.data.picture.data.url,
    });

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
  async (req: any, res: Response, next: NextFunction) => {
    const { refreshToken } = req.session;
    if (!refreshToken)
      return next(new AppError('Please provide a valid refresh token', 400));
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as jwt.JwtPayload;
    createTokens(req.user._id as ObjectId, req, false);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {},
    });
  }
);

export const isLoggedIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
      message: 'User is logged in',
      data: {},
    });
  }
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No user found with this email', 404));
    }

    const resetPasswordToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/passwordreset/${resetPasswordToken}`;

    try {
      await sendResetPasswordEmail(resetURL, user.email);

      res.status(200).json({
        status: 'success',
        message: 'Reset instructions is sent to your email',
        data: {},
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'An error accured while sending the email. Try again later!',
          500
        )
      );
    }
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new AppError('Token is invalid or expired', 400));
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.changedPasswordAt = new Date(Date.now() - 1000);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
      data: {},
    });
  }
);
