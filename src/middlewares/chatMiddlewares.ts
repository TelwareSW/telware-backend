import AppError from '@base/errors/AppError';
import Chat from '@base/models/chatModel';
import IUser from '@base/types/user';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

interface Member {
  _id: mongoose.Types.ObjectId;
  Role: 'member' | 'admin' | 'creator';
}

const restrictTo =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const user: IUser = req.user as IUser;
    const userId: any = user._id;
    const chat = await Chat.findById(chatId);
    const userChats = user.chats;
    if (!userChats.includes(new mongoose.Types.ObjectId(chatId)))
      return next(
        new AppError(
          'you are not a member of this chat, you are not allowed here',
          403
        )
      );

    if (!chat)
      return next(new AppError('this chat does no longer exists', 400));

    const chatMembers = chat.members;
    const member: Member = chatMembers.find((m) =>
      m._id.equals(userId)
    ) as unknown as Member;

    if (
      member &&
      chat.type !== 'private' &&
      roles.length !== 0 &&
      !roles.includes(member.Role)
    )
      return next(new AppError('you do not have permission', 403));
    next();
  };

export default restrictTo;
