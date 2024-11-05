import { Response } from 'express';
import AppError from './AppError';

export const sendDevError = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    name: err.name,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

export const sendProdError = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong :(',
    });
  }
};

export const handleDuplicateKeysError = (err: Error): AppError =>
  new AppError(err.message, 409);

export const handleInvalidPrivacyOption = (err: AppError) => {
  err.message = 'Invalid Privacy Option.';
  return new AppError(err.message, 400);
};
