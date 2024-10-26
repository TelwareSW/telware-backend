import { sign } from 'jsonwebtoken';
import { CookieOptions, Response } from 'express';
import { ObjectId } from 'mongoose';
import { IReCaptchaResponse } from '@base/types/recaptchaResponse';
import IUser from '@base/types/user';
import User from '@base/models/userModel';
import crypto from 'crypto';

export const validateBeforeLogin = async (
  email: string,
  password: string
): Promise<string> => {
  if (!email || !password) return 'missing email or password';

  const user = await User.findOne({ email }).select('+password');
  if (user && user.accountStatus === 'unverified')
    return 'please verify your email first to be able to login';
  if (user && !(await user.isCorrectPassword(password)))
    return 'wrong email or password';

  return 'validated';
};

export const generateUsername = async (): Promise<string> => {
  let username: string;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    username = btoa(Math.random().toString(36).substring(2, 17));
    username = username.replace(/[^a-zA-Z0-9]/g, '');
    // eslint-disable-next-line no-await-in-loop
    const user = await User.findOne({ username });
    if (!user) return username;
  }
};

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

export const verifyReCaptcha = async (
  recaptchaResponse: string
): Promise<IReCaptchaResponse> => {
  if (!recaptchaResponse)
    return { message: 'please validate the recaptcha', response: 400 };

  const verificationURL: string = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaResponse}`;
  const verificationResponse = await fetch(verificationURL, {
    method: 'POST',
  });
  const verificationResponseData = await verificationResponse.json();
  if (!verificationResponseData.success)
    return { message: 'reCaptcha verification failed', response: 400 };
  return { message: 'recaptcha is verified', response: 200 };
};

export const isCorrectVerificationCode = async (
  user: IUser,
  verificationCode: string
): Promise<boolean> => {
  const hashedCode = crypto
    .createHash('sha256')
    .update(verificationCode)
    .digest('hex');

  if (
    hashedCode !== user.emailVerificationCode ||
    (user.emailVerificationCodeExpires &&
      Date.now() > user.emailVerificationCodeExpires)
  )
    return false;
  return true;
};

export const createOAuthUser = async (
  profile: any,
  additionalData: any
): Promise<any> => {
  const user = await User.findOne({ providerId: profile.id });
  if (user) return user;

  console.log('new user');

  const { phoneNumber } = additionalData;
  let { email } = additionalData;

  const photo = profile.photos ? profile.photos[0].value : undefined;
  if (!email) {
    email = profile.emails ? profile.emails[0].value : undefined;
  }

  const username = await generateUsername();

  const newUser: IUser = new User({
    provider: profile.provider,
    providerId: profile.id,
    screenName: profile.displayName,
    accountStatus: 'active',
    email,
    photo,
    phoneNumber,
    username,
  });
  await newUser.save({ validateBeforeSave: false });
  return newUser;
};
