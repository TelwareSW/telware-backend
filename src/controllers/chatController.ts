import AppError from '@base/errors/AppError';
import Chat from '@base/models/chatModel';
import Message from '@base/models/messageModel';
import NormalChat from '@base/models/normalChatModel';
import User from '@base/models/userModel';
import {
  getChats,
  getLastMessage,
  unmute,
  deleteChatPictureFile,
} from '@base/services/chatService';
import IUser from '@base/types/user';
import catchAsync from '@base/utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import GroupChannel from '@base/models/groupChannelModel';

export const getAllChats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user: IUser = req.user as IUser;
    const type = req.query.type as string;
    if (!user) return next(new AppError('you need to login first', 400));
    const userId: mongoose.Types.ObjectId = user._id as mongoose.Types.ObjectId;
    const allChats = await getChats(userId, type);

    if (!allChats || allChats.length === 0)
      return res.status(200).json({
        status: 'success',
        message: 'no chats found',
        data: {},
      });
    const memberIds = [
      ...new Set(
        allChats.flatMap((chat: any) =>
          chat.chat.members.map((member: any) => member.user)
        )
      ),
    ];
    const members = await User.find(
      { _id: { $in: memberIds } },
      'username screenFirstName screenLastName phoneNumber photo status isAdmin stories blockedUsers'
    );
    const lastMessages = await getLastMessage(allChats);

    res.status(200).json({
      status: 'success',
      message: 'Chats retrieved successfuly',
      data: { chats: allChats, members, lastMessages },
    });
  }
);

export const getMessages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;

    const page: number = parseInt(req.query.page as string, 10) || 1;
    const limit: number = parseInt(req.query.limit as string, 10) || 20;
    const skip: number = (page - 1) * limit;
    const messages = await Message.find({ chatId }).limit(limit).skip(skip);

    res.status(200).json({
      status: 'success',
      message: 'messages retreived successfuly',
      data: { messages, nextPage: page + 1 },
    });
  }
);

export const postMediaFile = catchAsync(async (req: any, res: Response) => {
  if (!req.file) {
    throw new AppError('An error occured while uploading the story', 500);
  }

  res.status(200).json({
    status: 'success',
    message: 'Uploaded media file successfuly',
    data: {
      mediaFileName: req.file.filename,
    },
  });
});

export const enableSelfDestructing = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const { destructionDuration } = req.body;
    const destructionTimestamp = Date.now();
    if (!destructionDuration)
      return next(new AppError('missing required fields', 400));
    const chat = await NormalChat.findByIdAndUpdate(chatId, {
      destructionDuration,
      destructionTimestamp,
    });

    if (!chat) return next(new AppError('No chat with the provided id', 404));
    res.status(200).json({
      status: 'success',
      message: 'Destruction time is enabled successfuly',
    });
  }
);

export const disableSelfDestructing = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const chat = NormalChat.findByIdAndUpdate(chatId, {
      destructionTimestamp: undefined,
      destructionDuration: undefined,
    });
    if (!chat) return next(new AppError('No chat with the provided id', 404));
    res.status(200).json({
      status: 'success',
      message: 'Destruction time is disabled successfuly',
    });
  }
);

export const getChat = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId).populate(
    'members.user',
    'username screenFirstName screenLastName phoneNumber photo status isAdmin'
  );
  if (!chat) {
    throw new AppError('No chat with the provided id', 404);
  }
  return res.status(200).json({
    status: 'success',
    message: 'Chat retrieved successfuly',
    data: {
      chat,
    },
  });
});

export const setPrivacy = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { privacy } = req.body;
    const { chatId } = req.params;
    if (!privacy || !chatId)
      return next(new AppError('missing required fields', 400));
    const isPrivate: boolean = privacy === 'private';
    const chat = await GroupChannel.findByIdAndUpdate(
      chatId,
      { privacy: isPrivate },
      { new: true }
    );
    if (!chat)
      return next(new AppError('no chat found with the provided id', 400));
    res.status(200).json({
      status: 'success',
      message: 'privacy updated successfuly',
      data: { chat },
    });
  }
);

export const getChatMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat)
      return next(new AppError('no chat found with the provided Id', 400));
    res.status(200).json({
      status: 'success',
      message: 'retrieved chats successfuly',
      data: { members: chat.members },
    });
  }
);

export const muteChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const { muteDuration } = req.body;
    const user: IUser = req.user as IUser;
    if (!user) return next(new AppError('login first', 403));
    if (!muteDuration)
      return next(new AppError('missing required fields', 400));
    user.chats.forEach((c: any) => {
      if (c.chat.equals(chatId)) {
        c.isMuted = true;
        c.muteDuration = muteDuration;
      }
    });
    await user.save({ validateBeforeSave: false });
    unmute(user, chatId, muteDuration);
    res.status(200).json({
      status: 'success',
      message: 'Chat muted successfully',
    });
  }
);

export const unmuteChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const user: IUser = req.user as IUser;
    if (!user) return next(new AppError('login first', 403));

    user.chats.forEach((c: any) => {
      if (c.chat.equals(chatId)) {
        c.isMuted = false;
        c.muteDuration = undefined;
      }
    });
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Chat unmuted successfully',
    });
  }
);

export const updateChatPicture = catchAsync(async (req: any, res: Response) => {
  const { chatId } = req.params;

  if (!req.file) {
    throw new AppError('An error occured while uploading the story', 500);
  }

  await deleteChatPictureFile(chatId);

  await GroupChannel.findByIdAndUpdate(
    chatId,
    { picture: req.file.filename },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    status: 'success',
    message: 'chat picture updated successfuly',
    data: {},
  });
});
