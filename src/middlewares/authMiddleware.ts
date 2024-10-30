import { Request, Response, NextFunction } from 'express';
import catchAsync from '@utils/catchAsync';
import AppError from '@errors/AppError';
import jwt from 'jsonwebtoken';
import User from '@models/userModel';

export const createSessionFromHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sessionId = req.header('X-Session-Token') as string;
  if (sessionId) {
    req.sessionID = sessionId;
  }
  next();
};

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.session;

    if (!accessToken) {
      return next(
        new AppError('No token provided, you are not allowed here!', 401)
      );
    }

    const decodedPayload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as jwt.JwtPayload;
    const currentUser = await User.findById(decodedPayload.id);
    if (!currentUser) {
      return next(
        new AppError('User has been deleted!! You can not log in', 401)
      );
    }

    // TODO: Implement this method in the user model
    // if (currentUser.changedPassword(decodedPayload.iat)) {
    //   return next(
    //     new AppError('User has changed password!! Log in again.', 401)
    //   );
    // }

    req.user = currentUser;
    next();
  }
);
