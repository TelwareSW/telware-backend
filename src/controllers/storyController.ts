import AppError from '@base/errors/AppError';
import Story from '@base/models/storySchema';
import User from '@base/models/userModel';
import catchAsync from '@base/utils/catchAsync';
import { Request, Response } from 'express';

export const getCurrentUserStory = catchAsync(async (req: Request, res: Response) => { });
export const postStory = catchAsync(async (req: Request, res: Response) => {
  const { caption } = req.body;
  //const userId = req.user.id;   //TODO: use this to get the authenticated user id and use it below

  if (!req.file) {
    throw new AppError('An error occured while uploading the story', 500);
  }

  const newStory = new Story({
    content: req.file?.filename,
    caption,
    views: [],
  });

  await newStory.save();

  const user = await User.findByIdAndUpdate(
    '6718035409b1d3b2f3a0ebbb',
    { $push: { stories: newStory._id } },
    { new: true, runValidators: true }
  ); //TODO: replace the hardcoded user id with userId variable.

  console.log('user', user);

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(201).json({
    status: 'success',
    message: 'Story created successfuly',
    data: {},
  });
});
export const deleteStory = catchAsync(async (req: Request, res: Response) => { });

export const getStory = catchAsync(async (req: Request, res: Response) => { });
export const viewStory = catchAsync(async (req: Request, res: Response) => { });
