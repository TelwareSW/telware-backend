import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import catchAsync from '@utils/catchAsync';
import AppError from '@errors/AppError';
import jwt from 'jsonwebtoken';
import User from '@models/userModel';
import { Session, SessionData } from 'express-session';

export const generateSession = (req: any) => {
  const sessionId = req.header('X-Session-Token') as string;
  if (sessionId) {
    req.sessionID = sessionId;
    req.fromHeader = true;
  }
  return req.sessionID || randomUUID();
};

export const deleteNotUsedSessions = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.on('finish', () => {
    if (!req.session.accessToken || !req.session.refreshToken) {
      req.session.destroy((err) => {
        if (err) console.error('Error destroying not needed session:', err);
      });
    }
  });
  next();
};

const getSession = (
  req: Request,
  sessionId: string
): Promise<Session & Partial<SessionData>> =>
  new Promise((resolve, reject) => {
    req.sessionStore.get(sessionId, (err, session) => {
      if (err) return reject(err);
      if (!session)
        return reject(
          new AppError('Session not found, you are not allowed here!', 401)
        );
      resolve(session as Session & Partial<SessionData>);
    });
  });

export const protect = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (req.fromHeader) {
      const currentSession = await getSession(req, req.sessionID);
      req.session.accessToken = currentSession.accessToken;
      req.session.refreshToken = currentSession.refreshToken;
    }

    const { accessToken } = req.session;

    if (!accessToken) {
      return next(
        new AppError('Session not found, you are not allowed here!', 401)
      );
    }

    const decodedPayload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as jwt.JwtPayload;
    const currentUser = await User.findById(decodedPayload.id).select(
      '+password'
    );
    if (!currentUser) {
      return next(
        new AppError('User has been deleted!! You can not log in', 401)
      );
    }

    if (currentUser.passwordChanged(decodedPayload.iat as number)) {
      return next(
        new AppError('User has changed password!! Log in again.', 401)
      );
    }

    req.user = currentUser;
    next();
  }
);
