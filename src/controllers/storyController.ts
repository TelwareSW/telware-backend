import AppError from '@base/errors/AppError';
import Story from '@base/models/storyModel';
import User from '@base/models/userModel';
import {
  deleteStoryFile,
  deleteStoryInUser,
  getUserContacts,
  getUsersStoriesData,
} from '@base/services/storyService';
import catchAsync from '@base/utils/catchAsync';
import { Response } from 'express';
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

  return res.status(204).json({
    status: 'success',
    message: 'Story deleted successfuly',
    data: {},
  });
});

export const getStory = catchAsync(async (req: any, res: Response) => {
  const { userId } = req.params;
  const authUserId = req.user.id;

  const user = await User.findById(userId).populate(
    'stories',
    'id content caption timestamp'
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  if (!user.contacts.includes(authUserId)) {
    throw new AppError('You are not authorized to view these stories', 401);
  }

  return res.status(200).json({
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

  res.status(200).json({
    status: 'success',
    message: 'User viewed the story successfuly',
    data: {},
  });
});

export const getAllContactsStories = catchAsync(
  async (req: any, res: Response) => {
    const userId = req.user.id;

    // retrieve authenticated user contacts (users that there is a chat with them), returns a Set
    const contactsIds = await getUserContacts(userId);

    // get all contacts stories with also some of their data too (like id, username and profile picture).
    const data = await getUsersStoriesData([...contactsIds]);

    res.status(200).json({
      status: 'success',
      message: 'Stories retrieved successfuly',
      data,
    });
  }
);
