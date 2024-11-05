import { Request, Response, NextFunction } from 'express';
import AppError from './AppError';
import {
  handleDuplicateKeysError,
  sendDevError,
  sendProdError,
  handleInvalidPrivacyOption,
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
    let error: AppError = structuredClone(err);

    if (
      error.message ===
      'Validation failed: invitePermessionsPrivacy: `nobody` is not a valid enum value for path `invitePermessionsPrivacy`.'
    )
      error = handleInvalidPrivacyOption(error);

    if (error.name === 'ValidationError')
      error = handleDuplicateKeysError(error);

    sendProdError(err, res);
  }
};

export default globalErrorHandler;
