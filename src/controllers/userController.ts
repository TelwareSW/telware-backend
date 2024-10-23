import AppError from '@base/errors/AppError';
import User from '@base/models/userModel';
import catchAsync from '@base/utils/catchAsync';
import { Request, Response } from 'express';

interface GetCurrentUser extends Request {
  params: {
    id?: string;
  };
}

const userController = {
  getUser: catchAsync(async (req: GetCurrentUser, res: Response) => {
    const { id } = req.params;

    let user;
    if (id) user = await User.findById(id, 'username screenName email photo status bio');
    else user = await User.findById(1); //TODO: edit the id passed here to be the authenticated user id

    if (!user) {
      throw new AppError('No User exists with this ID', 404);
    }

    return res.status(200).json({
      status: 'success',
      message: 'User retrieved successfuly',
      data: {
        user,
      },
    });
  }),
  getAllUsers: catchAsync(async (req: Request, res: Response) => {
    const users = await User.find({}, 'username screenName email photo status bio');

    res.status(200).json({
      status: 'success',
      message: 'Users retrieved successfuly',
      data: {
        users,
      },
    });
  }),
};

export default userController;
