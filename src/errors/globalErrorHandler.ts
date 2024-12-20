import { Request, Response, NextFunction } from 'express';
import AppError from './AppError';
import {
  handleDuplicateKeysError,
  sendDevError,
  sendProdError,
  handleInvalidPrivacyOption,
  handleInvalidAuth
} from './errorHandlers';

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
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (
      err.message ===
      'Validation failed: invitePermessionsPrivacy: `nobody` is not a valid enum value for path `invitePermessionsPrivacy`.'
    )
      err = handleInvalidPrivacyOption(err);
    if (
      err.message ===
      "You are not authorized to access this resource"
    )
      err = handleInvalidAuth(err);

    if (err.name === 'ValidationError') err = handleDuplicateKeysError(err);

    sendProdError(err, res);
  }
  if (
    err.message ===
    "You are not authorized to access this resource"
  )
    err = handleInvalidAuth(err);

};

export default globalErrorHandler;
sdad