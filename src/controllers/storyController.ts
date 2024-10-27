import AppError from '@base/errors/AppError';
import Story from '@base/models/storySchema';
import User from '@base/models/userModel';
import { deleteStoryFile, deleteStoryInUser } from '@base/services/storyService';
import catchAsync from '@base/utils/catchAsync';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

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

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(201).json({
    status: 'success',
    message: 'Story created successfuly',
    data: {},
  });
});
export const deleteStory = catchAsync(async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyObjectId = new mongoose.Types.ObjectId(storyId);

  // Delete the story from the user stories
  await deleteStoryInUser(storyObjectId, '6718035409b1d3b2f3a0ebbb'); //TODO: replace the hardcoded id with the authenticated user id.

  // Delete the story file in the server
  await deleteStoryFile(storyObjectId);

  // Delete the story object from the database.
  await Story.deleteOne({ _id: storyObjectId });

  return res.status(200).json({
    status: 'success',
    message: 'Story deleted successfuly',
    data: {},
  });
});

export const getStory = catchAsync(async (req: Request, res: Response) => { });
export const viewStory = catchAsync(async (req: Request, res: Response) => { });
