import catchAsync from '@base/utils/catchAsync';
import User from '@base/models/userModel';
import { Request, Response, NextFunction } from 'express';
import sendConfirmationCodeEmail from '@base/utils/email';
import AppError from '@base/errors/AppError';
import { generateUsername, verifyReCaptcha } from '@base/services/authService';
import { IReCaptchaResponse } from '@base/types/recaptchaResponse';

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

    res.status(201).json({
      status: 'success',
      message: `User is created successfuly. Please verify your account`,
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
