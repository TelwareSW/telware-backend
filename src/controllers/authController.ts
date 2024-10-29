import catchAsync from '@utils/catchAsync';
import User from '@models/userModel';
import { Request, Response, NextFunction } from 'express';
import AppError from '@errors/AppError';
import {
  generateUsername,
  isCorrectVerificationCode,
  signToken,
  storeCookie,
  validateBeforeLogin,
  sendEmailVerificationCode,
  // verifyReCaptcha,
} from '@services/authService';
// import { IReCaptchaResponse } from '@base/types/recaptchaResponse';
import { ObjectId } from 'mongoose';
import IUser from '@base/types/user';

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phoneNumber, password, passwordConfirm } = req.body;

    // const reCaptchaMessageResponse: IReCaptchaResponse =
    //   await verifyReCaptcha(recaptchaResponse);

    // if (reCaptchaMessageResponse.response === 400)
    //   return next(new AppError(reCaptchaMessageResponse.message, 400));

    const username: string = await generateUsername();

    const user: IUser = await User.create({
      username,
      email,
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
