import AppError from '@base/errors/AppError';
import Chat from '@base/models/chatModel';
import IUser from '@base/types/user';
import { NextFunction, Request, Response } from 'express';

const restrictToMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { chatId } = req.params;
  const user: IUser = req.user as IUser;
  const userId: any = user._id;
  const chat = await Chat.findById(chatId);
  if (!chat) return next(new AppError('this chat does no longer exists', 400));
  const chatMembers = chat.members;
  if (!chatMembers)
    return next(
      new AppError('the chat has no members, you cannot access it anymore', 403)
    );
  if (!chatMembers.includes(userId))
    return next(
      new AppError(
        'you are not a member of this chat, you are not allowed here',
        403
      )
    );
  next();
};

export default restrictToMembers;
