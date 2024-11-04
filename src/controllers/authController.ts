import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import catchAsync from '@utils/catchAsync';
import User from '@models/userModel';
import AppError from '@errors/AppError';
import {
  isCorrectVerificationCode,
  validateBeforeLogin,
  sendEmailVerificationCode,
  verifyReCaptcha,
  generateUsername,
  sendResetPasswordEmail,
} from '@services/authService';
import {
  getAllSessionsByUserId,
  saveSession,
  destroySession,
  getSession,
  destroyAllSessionsByUserId,
} from '@services/sessionService';
import { IReCaptchaResponse } from '@base/types/recaptchaResponse';
import { ObjectId } from 'mongoose';
import IUser from '@base/types/user';
import redisClient from '@config/redis';
import { SessionData } from 'express-session';

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phoneNumber, password, passwordConfirm, reCaptchaResponse } =
      req.body;

    if (
      !email ||
      !phoneNumber ||
      !password ||
      !passwordConfirm ||
      !reCaptchaResponse
    )
      return next(new AppError('Please provide all required fields', 400));

    const reCaptchaMessageResponse: IReCaptchaResponse =
      await verifyReCaptcha(reCaptchaResponse);

    if (reCaptchaMessageResponse.response === 400)
      return next(new AppError(reCaptchaMessageResponse.message, 400));

    const username: string = await generateUsername();

    const user: IUser = await User.create({
      email,
      username,
      phoneNumber,
      password,
      passwordConfirm,
    });

    const errorState = { errorCaught: true };
    await sendEmailVerificationCode(user, next, errorState);
    if (errorState.errorCaught) return;
    return res.status(201).json({
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
        new AppError('No user is found with this email address', 404)
      );

    const message: string = await validateBeforeLogin(email, password);
    if (message === 'please verify your email first to be able to login')
      return next(new AppError(message, 403));
    if (message !== 'validated') return next(new AppError(message, 400));

    await saveSession(user._id as ObjectId, req);
    res.status(200).json({
      status: 'success',
      message: 'logged in successfully',
      data: {
        user,
        sessionId: req.sessionID,
      },
    });
  }
);

export const sendConfirmationCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user: IUser = (await User.findOne({ email }).select(
      '+emailVerificationCode +emailVerificationCodeExpires'
    )) as IUser;
    const errorState = { errorCaught: true };
    await sendEmailVerificationCode(user, next, errorState);
    if (errorState.errorCaught) return;
    res.status(200).json({
      status: 'success',
      message: 'verification email sent',
      data: {},
    });
  }
);

export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, verificationCode } = req.body;
    if (!email) return next(new AppError('Provide your email', 400));
    const user = await User.findOne({ email }).select(
      '+emailVerificationCode +emailVerificationCodeExpires +verificationAttempts'
    );
    if (!user)
      return next(
        new AppError('You need to register before verifying your email', 404)
      );
    if (user.accountStatus !== 'unverified')
      return next(new AppError('your account is already verified', 400));
    if (!verificationCode)
      return next(new AppError('Provide your verification code', 400));
    if (
      user.emailVerificationCodeExpires &&
      user.emailVerificationCodeExpires < Date.now()
    ) {
      user.verificationAttempts = 0;
      await user.save();
      return next(
        new AppError(
          'verification code expired, you can ask for a new one',
          400
        )
      );
    }

    if (user.verificationAttempts && user.verificationAttempts > 2)
      return next(
        new AppError(
          'You have reached the maximum number of attempts, please try again later',
          403
        )
      );
    const verified: boolean = await isCorrectVerificationCode(
      user,
      verificationCode
    );
    if (!verified && user.verificationAttempts !== undefined) {
      user.verificationAttempts += 1;
      await user.save();
      return next(new AppError('verification code is not correct', 400));
    }
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    user.accountStatus = 'active';
    user.verificationAttempts = undefined;
    await user.save({ validateBeforeSave: false });
    await saveSession(user._id as ObjectId, req);

    // FIXME: we need to send more info here (unify user object response with login)
    const { username, screenFirstName, screenLastName, photo, status, bio } =
      user;
    res.status(200).json({
      status: 'success',
      message: 'Account got verified successfully',
      data: {
        user: {
          username,
          screenFirstName,
          screenLastName,
          email,
          photo,
          status,
          bio,
        },
        sessionId: req.sessionID,
      },
    });
  }
);

export const oAuthCallback = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    await saveSession(req.user.id as ObjectId, req);
    const { sessionID } = req;
    if (req.header('origin')) {
      res.redirect(
        `${req.protocol}://${process.env.FRONTEND_URL}/login?oauth=true`
      );
    } else {
      res.redirect(
        `${process.env.CROSS_PLATFORM_OAUTH_REDIRECT_URL}/${sessionID}`
      );
    }
  }
);

export const isLoggedIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
      message: 'User is logged in',
      data: {},
    });
  }
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No user found with this email', 404));
    }

    const resetPasswordToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${process.env.FRONTEND_URL}/password-reset/${resetPasswordToken}`;

    try {
      await sendResetPasswordEmail(resetURL, user.email);

      res.status(200).json({
        status: 'success',
        message: 'Reset instructions is sent to your email',
        data: {},
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'An error accured while sending the email. Try again later!',
          500
        )
      );
    }
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new AppError('Token is invalid or expired', 400));
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.changedPasswordAt = new Date(Date.now() - 1000);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
      data: {},
    });
  }
);

export const logoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.body;
    await redisClient.sRem(
      `user:${req.session.user?.id}:sessions`,
      sessionId || req.sessionID
    );
    await destroySession(req, res, sessionId);
    res.status(204).json({
      status: 'success',
      message: 'User logged out successfully',
      data: {},
    });
  }
);

export const logoutAll = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await destroyAllSessionsByUserId(req, res);
    await destroySession(req, res);
    res.status(204).json({
      status: 'success',
      message: 'All Sessions logged out successfully',
      data: {},
    });
  }
);

export const logoutOthers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await destroyAllSessionsByUserId(req, res);
    await redisClient.sAdd(
      `user:${req.session.user?.id}:sessions`,
      req.sessionID
    );
    res.status(204).json({
      status: 'success',
      message: 'All Other Sessions logged out successfully',
      data: {},
    });
  }
);

export const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    if (!(await user.isCorrectPassword(oldPassword))) {
      return next(new AppError('Wrong password', 400));
    }
    user.password = newPassword;
    user.passwordConfirm = confirmNewPassword;
    user.changedPasswordAt = new Date(Date.now() - 1000);
    await user.save();

    await redisClient.sRem(
      `user:${req.session.user?.id}:sessions`,
      req.sessionID
    );
    await saveSession(user._id as ObjectId, req);
    res.status(200).json({
      status: 'success',
      message: 'password changed successfully',
      data: {
        sessionId: req.sessionID,
      },
    });
  }
);

export const getLogedInSessions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sessionIds = await getAllSessionsByUserId(
      req.session.user?.id as ObjectId
    );
    const promises = sessionIds.map((sessionId) => getSession(req, sessionId));
    const sessions = ((await Promise.all(promises)) as SessionData[]).filter(
      (session) => session
    );
    const usersInfo = sessions.map((session) => ({
      agent: session.user.agent,
      status: session.user.status,
      lastSeenTime: session.user.lastSeenTime,
    }));

    res.status(200).json({
      status: 'success',
      message: 'Got all sessions successfully',
      data: {
        sessions: usersInfo,
      },
    });
  }
);
