import AppError from '@base/errors/AppError';
import GroupChannel from '@base/models/groupChannelModel';
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
