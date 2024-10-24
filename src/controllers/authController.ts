import catchAsync from '@base/utils/catchAsync';
import User from '@base/models/userModel';
import { Request, Response, NextFunction } from 'express';
import generateUsername from '@utils/generateUsername';
import {
  verifyReCaptcha,
  IReCaptchaResponse,
} from '@base/utils/verifyReCaptcha';

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

export const signin = catchAsync(
  async (req: Request, res: Response, next: Function) => {}
);
