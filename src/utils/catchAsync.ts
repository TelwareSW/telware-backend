import { Request, Response, NextFunction } from 'express';

const catchAsync =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

export default catchAsync;
