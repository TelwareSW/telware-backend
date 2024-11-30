import AppError from '@base/errors/AppError';
import Chat from '@base/models/chatModel';
import GroupChannel from '@base/models/groupChannelModel';
import Message from '@base/models/messageModel';
import NormalChat from '@base/models/normalChatModel';
import { getChats } from '@base/services/chatService';
import IUser from '@base/types/user';
import catchAsync from '@base/utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

export const createChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, name, members } = req.body;
    if ((!name && type !== 'private') || !type || !members)
      return next(new AppError('please provide all required fields', 400));

    let newChat;
    if (type && type === 'private')
      newChat = new NormalChat({
        members,
      });
    else
      newChat = new GroupChannel({
        name,
        members,
      });

    await newChat.save();
    res.status(201).json({
      status: 'success',
      message: 'Chat created successfuly',
      data: newChat,
    });
  }
);

export const getAllChats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user: IUser = req.user as IUser;
    const { type } = req.params;
    if (!user) return next(new AppError('you need to login first', 400));
    const userId: mongoose.Types.ObjectId = user._id as mongoose.Types.ObjectId;
    const chats = await getChats(userId, type);
    res.status(200).json({
      status: 'success',
      message: 'Chats retrieved successfuly',
      data: chats,
    });
  }
);

export const getMessages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const page: number = parseInt(req.query.page as string, 10) || 1;
    const limit: number = parseInt(req.query.limit as string, 10) || 100;
    const skip: number = (page - 1) * limit;
    const messages = await Message.find({ chatId })
      .select('content')
      .limit(limit)
      .skip(skip);
    res.status(200).json({
      status: 'success',
      message: 'messages retreived successfuly',
      data: messages,
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
    const chat = Chat.findByIdAndUpdate(chatId, {
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
    const chat = Chat.findByIdAndUpdate(chatId, {
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
