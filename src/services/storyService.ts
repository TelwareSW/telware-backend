import AppError from '@base/errors/AppError';
import Story from '@base/models/storyModel';
import User from '@base/models/userModel';
import mongoose from 'mongoose';
import { unlink } from 'fs/promises';
import path from 'path';
import Chat from '@base/models/chatModel';
import IStory from '@base/types/story';

interface UserAndStoriesData {
  userId: string | mongoose.Types.ObjectId;
  name: string;
  photo: string | undefined;
  stories: IStory[];
}

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

// Returns all the users ids that the user has a private chat with
export const getUserContacts = async (
  userId: mongoose.Types.ObjectId | string
) => {
  let userIdObj = userId;
  if (typeof userId === 'string') {
    userIdObj = new mongoose.Types.ObjectId(userId);
  }

  // Get the private chats that the user is in
  const chats = await Chat.find({
    type: 'private',
    members: userIdObj,
  });

  // Get all the users that the user has a private chat with
  const contacts: Set<string> = new Set();
  chats.forEach((chat) => {
    const { members } = chat;
    members.forEach((memberId) => {
      if (memberId.toString() !== userId) contacts.add(memberId.toString());
    });
  });

  return contacts;
};

export const getUsersStoriesData = async (users: string[]) => {
  const data: UserAndStoriesData[] = await Promise.all(
    users.map(async (userId) => {
      const user = await User.findById(userId).populate(
        'stories',
        'id content caption timestamp'
      );
      if (!user) {
        throw new AppError('No User exists with this ID', 404);
      }
      const dataObject: UserAndStoriesData = {
        userId,
        name: user.username,
        photo: user.photo,
        stories: user.stories as any,
      };

      return dataObject;
    })
  );

  return data;
};
