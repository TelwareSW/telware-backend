import { Request, Response, NextFunction } from 'express';
import AppError from './AppError';
import { sendDevError, sendProdError } from './errorHandlers';

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    const error = structuredClone(err);

    // TODO: Handle all the errors here

    sendProdError(error, res);
  }
};

export default globalErrorHandler;
