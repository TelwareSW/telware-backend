import AppError from '@base/errors/AppError';
import Story from '@base/models/storySchema';
import User from '@base/models/userModel';
import mongoose from 'mongoose';
import { unlink } from 'fs/promises';
import path from 'path';

export const deleteStoryInUser = async (
  storyId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId | string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  const storyIndex = user.stories.indexOf(storyId);
  if (storyIndex === -1) {
    throw new AppError('No story exist with this ID in your stories', 404);
  }

  user.stories.splice(storyIndex, 1);
  await user.save();
};

export const deleteStoryFile = async (storyId: mongoose.Types.ObjectId) => {
  const story = await Story.findById(storyId);

  if (!story) {
    throw new AppError('No Story exist with this ID', 404);
  }

  const fileName = story.content;

  await unlink(path.join(process.cwd(), 'src/public/media/', fileName));
};
