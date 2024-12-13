import AppError from '@base/errors/AppError';
import Chat from '@base/models/chatModel';
import IUser from '@base/types/user';
import catchAsync from '@base/utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

const restrictTo = (...roles: string[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const user: IUser = req.user as IUser;
    const userId: any = user._id;
    const chat = await Chat.findById(chatId);
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId))
      return next(new AppError('please provide a valid chat ID', 400));
    if (!chat)
      return next(new AppError('this chat does no longer exists', 400));
    const userChats = user.chats;
    if (
      !userChats.some((userChat) =>
        userChat.chat.equals(new mongoose.Types.ObjectId(chatId))
      )
    )
      return next(
        new AppError(
          'you are not a member of this chat, you are not allowed here',
          403
        )
      );

    const chatMembers = chat.members;
    const member = chatMembers.find((m: any) => m.user.equals(userId));

    if (
      member &&
      chat.type !== 'private' &&
      roles.length !== 0 &&
      !roles.includes(member.Role)
    )
      return next(new AppError('you do not have permission', 403));
    next();
  });

export default restrictTo;
