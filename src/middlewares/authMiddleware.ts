import { Request, Response, NextFunction } from 'express';
import catchAsync from '@utils/catchAsync';
import AppError from '@errors/AppError';
import User from '@models/userModel';
import { reloadSession } from '@services/sessionService';
import redisClient from '@base/config/redis';

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await reloadSession(req);
    if (!req.session.user) {
      return next(
        new AppError('Session not found, you are not allowed here!', 401)
      );
    }

    const currentUser = await User.findById(req.session.user.id).select(
      '+password'
    );
    if (!currentUser) {
      return next(
        new AppError('User has been deleted!! You can not log in', 401)
      );
    }

    if (currentUser.passwordChanged(req.session.user.timestamp)) {
      return next(
        new AppError('User has changed password!! Log in again.', 401)
      );
    }
    req.session.user.lastSeenTime = Date.now();
    req.user = currentUser;
    next();
  }
);

export const savePlatformInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const platform = (req.query.platform as string) || 'web';
    await redisClient.set('platform', platform);
    next();
  }
);

export const isAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    next();
  }
);
