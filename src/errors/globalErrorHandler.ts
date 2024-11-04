import { Request, Response, NextFunction } from 'express';
import AppError from './AppError';
import { sendDevError, sendProdError } from './errorHandlers';

const handleInvalidPrivacyOption = (err: AppError) => {
  err.message = 'Invalid Privacy Option.';
  return new AppError(err.message, 400);
};

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log(err.message);
  if (process.env.NODE_ENV === 'development') {
    if (
      err.message ===
      'Validation failed: invitePermessionsPrivacy: `nobody` is not a valid enum value for path `invitePermessionsPrivacy`.'
    )
      err = handleInvalidPrivacyOption(err);

    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //TODO: Handle all the errors here

    sendProdError(err, res);
  }
};

export default globalErrorHandler;
