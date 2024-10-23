import { sign } from 'jsonwebtoken';
import { CookieOptions, Response } from 'express';
import { ObjectId } from 'mongoose';

export const signToken = (
  id: ObjectId,
  TOKEN_SECRET: string,
  TOKEN_EXPIRES_IN: string
) =>
  sign({ id }, TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });

export const storeCookie = (
  res: Response,
  COOKIE_EXPIRES_IN: string,
  token: string,
  cookieName: string
): void => {
  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + Number(COOKIE_EXPIRES_IN) * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie(cookieName, token, cookieOptions);
};
