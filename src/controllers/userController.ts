import AppError from '@base/errors/AppError';
import User from '@base/models/userModel';
import catchAsync from '@base/utils/catchAsync';
import { Request, Response } from 'express';

interface GetUser extends Request {
  params: {
    id?: string;
  };
  //TODO: add a user here that would contain the user data.
}

export const getUser = catchAsync(async (req: GetUser, res: Response) => {
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
});

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.find({}, 'username screenName email photo status bio');

  return res.status(200).json({
    status: 'success',
    message: 'Users retrieved successfuly',
    data: {
      users,
    },
  });
});

export const updateBio = catchAsync(async (req: Request, res: Response) => {
  const { bio } = req.body;

  //TODO: change this to get the current logged in user.
  const user = await User.findByIdAndUpdate(
    '6718035409b1d3b2f3a0ebbb',
    { bio },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(200).json({
    status: 'success',
    message: 'User bio updated successfuly',
    data: {},
  });
});

export const updatePhoneNumber = catchAsync(async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  //TODO: change this to get the current logged in user.
  const user = await User.findByIdAndUpdate(
    '6718035409b1d3b2f3a0ebbb',
    { phoneNumber },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(200).json({
    status: 'success',
    message: 'User phoneNumber updated successfuly',
    data: {},
  });
});

export const updateEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  //TODO: change this to get the current logged in user.
  const user = await User.findByIdAndUpdate(
    '6718035409b1d3b2f3a0ebbb',
    { email },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(200).json({
    status: 'success',
    message: 'User email updated successfuly',
    data: {},
  });
});

export const updateUsername = catchAsync(async (req: Request, res: Response) => {
  const { username } = req.body;

  //TODO: change this to get the current logged in user.
  const user = await User.findByIdAndUpdate(
    '6718035409b1d3b2f3a0ebbb',
    { username },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(200).json({
    status: 'success',
    message: 'User username updated successfuly',
    data: {},
  });
});

export const updateScreenName = catchAsync(async (req: Request, res: Response) => {
  const { screenName } = req.body;

  //TODO: change this to get the current logged in user.
  const user = await User.findByIdAndUpdate(
    '6718035409b1d3b2f3a0ebbb',
    { screenName },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(200).json({
    status: 'success',
    message: 'User screenName updated successfuly',
    data: {},
  });
});
