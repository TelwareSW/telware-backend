import catchAsync from '@base/utils/catchAsync';
import User from '@base/models/userModel';
import { Request, Response, NextFunction } from 'express';
import generateUsername from '@utils/generateUsername';
import {
  verifyReCaptcha,
  IReCaptchaResponse,
} from '@base/utils/verifyReCaptcha';
import sendConfirmationCodeEmail from '@base/utils/email';
import AppError from '@base/errors/AppError';

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phoneNumber, password, passwordConfirm, recaptchaResponse } =
      req.body;

    const reCaptchaMessageResponse: IReCaptchaResponse =
      await verifyReCaptcha(recaptchaResponse);

    if (reCaptchaMessageResponse.response === 400)
      res.status(400).json({
        status: 'fail',
        message: reCaptchaMessageResponse.message,
      });

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
    await sendConfirmationCodeEmail(user, verificationCode, next);

    res.status(200).json({
      status: 'success',
      message: 'verification email sent',
      data: {},
    });
  }
);
