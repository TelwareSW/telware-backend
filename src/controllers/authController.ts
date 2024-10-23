import catchAsync from '@base/utils/catchAsync';
import User from '@base/models/userModel';
import { Request, Response, NextFunction } from 'express';
import generateUsername from '@utils/generateUsername';

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phoneNumber, password, passwordConfirm } = req.body;
    const username: string = await generateUsername();

    await User.create({
      username,
      email,
      phoneNumber,
      password,
      passwordConfirm,
    });

    res.status(201).json({
      message: 'User is created. Please verify your account',
      data: {},
    });
  }
);

export const signin = catchAsync(
  async (req: Request, res: Response, next: Function) => {}
);
