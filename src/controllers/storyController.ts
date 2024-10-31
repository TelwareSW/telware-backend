import AppError from '@base/errors/AppError';
import Story from '@base/models/storySchema';
import User from '@base/models/userModel';
import {
  deleteStoryFile,
  deleteStoryInUser,
} from '@base/services/storyService';
import catchAsync from '@base/utils/catchAsync';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const getCurrentUserStory = catchAsync(
  async (req: any, res: Response) => {
    const userId = req.user.id;

    const user = await User.findById(userId).populate('stories');

    if (!user) {
      throw new AppError('No User exists with this ID', 404);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Stories retrieved successfuly',
      data: {
        stories: user.stories,
      },
    });
  }
);
export const postStory = catchAsync(async (req: any, res: Response) => {
  const { caption } = req.body;
  const userId = req.user.id;

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
    userId,
    { $push: { stories: newStory._id } },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(201).json({
    status: 'success',
    message: 'Story created successfuly',
    data: {},
  });
});
export const deleteStory = catchAsync(async (req: any, res: Response) => {
  const { storyId } = req.params;
  const userId = req.user.id;
  const storyObjectId = new mongoose.Types.ObjectId(storyId);

  // Delete the story from the user stories
  await deleteStoryInUser(storyObjectId, userId);

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

export const getStory = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  //TODO: HANDLE STORY PRIVACY OF THE USER.
  const user = await User.findById(userId).populate(
    'stories',
    'id content caption timestamp'
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Stories retrieved successfuly',
    data: {
      stories: user.stories,
    },
  });
});
export const viewStory = catchAsync(async (req: any, res: Response) => {
  const { storyId } = req.params;
  const userId = req.user.id;

  await Story.findByIdAndUpdate(
    storyId,
    { $addToSet: { views: userId } },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    status: 'success',
    message: 'User viewed the story successfuly',
    data: {},
  });
});
