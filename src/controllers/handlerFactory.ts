import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import AppError from '@errors/AppError';
import catchAsync from '@utils/catchAsync';

const factory = {
  deleteOne: (model: Model<any>, modelName: String) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const document = await model.findByIdAndDelete(req.params.id);

      if (!document) {
        return next(new AppError(`No ${modelName} exists with this ID`, 404));
      }

      res.status(204).json({
        status: 'success',
        message: `${modelName} deleted successfully`,
        data: null,
      });
    }),
};

export default factory;
