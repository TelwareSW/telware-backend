import { Request, Response, NextFunction } from 'express';
import catchAsync from '@base/utils/catchAsync';
import User from '@base/models/userModel';
import sendConfirmationCodeEmail from '@base/utils/email';
import AppError from '@base/errors/AppError';
import {
  generateUsername,
  isCorrectVerificationCode,
  signToken,
  storeCookie,
  validateBeforeLogin,
  verifyReCaptcha,
} from '@base/services/authService';
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

    const username: string = await generateUsername();

    await User.create({
      username,
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

    const token = signToken(
      user._id as ObjectId,
      process.env.ACCESS_TOKEN_SECRET as string,
      process.env.ACCESS_EXPIRES_IN as string
    );
    storeCookie(
      res,
      process.env.ACCESS_COOKIE_EXPIRES_IN as string,
      token,
      'accessToken'
    );

    res.status(200).json({
      status: 'success',
      message: 'logged in successfully',
      data: {
        user,
        token,
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

    const token = signToken(
      user._id as ObjectId,
      process.env.ACCESS_TOKEN_SECRET as string,
      process.env.ACCESS_EXPIRES_IN as string
    );
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    user.accountStatus = 'active';
    user.save();

    res.status(200).json({
      status: 'success',
      message: 'Account got verified successfully',
      data: {
        user,
        token,
      },
    });
  }
);

export const googleCallback = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    console.log(req.user);
    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully with google',
      data: {
        user: req.user,
        accessToken: req.authInfo.accessToken,
      },
    });
  }
);

export const githubCallback = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    console.log(req.user);
    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully with gihub',
      data: {
        user: req.user,
        accessToken: req.authInfo.accessToken,
      },
    });
  }
);
