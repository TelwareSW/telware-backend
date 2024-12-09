import AppError from '@base/errors/AppError';
import Chat from '@base/models/chatModel';
import Message from '@base/models/messageModel';
import NormalChat from '@base/models/normalChatModel';
import User from '@base/models/userModel';
import {
  deleteChatPictureFile,
  getChats,
  getLastMessage,
} from '@base/services/chatService';
import IUser from '@base/types/user';
import catchAsync from '@base/utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import redisClient from '@config/redis';
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

export const getAllDrafts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    try {
      const draftKey = `drafts:${userId}`;
      const draftsData = await redisClient.get(draftKey);
      if (!draftsData) {
        return res.status(404).json({
          success: false,
          message: 'No draft messages found',
        });
      }
      const drafts = JSON.parse(draftsData);
      return res.json({
        success: true,
        message: 'Draft messages synced',
        drafts,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const getDraft = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string;
    const chatId = req.query.chatId as string;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }
    try {
      const draftKey = `drafts:${userId}`;
      const draftsData = await redisClient.get(draftKey);
      if (!draftsData) {
        return res.status(404).json({
          success: false,
          message: 'No draft messages found for this user',
        });
      }
      const drafts = JSON.parse(draftsData);

      if (chatId) {
        const filteredDrafts = drafts.filter(
          (draft: any) => draft.chatId === chatId
        );

        if (filteredDrafts.length === 0) {
          return res.status(404).json({
            success: false,
            message: `No draft messages found for chat ${chatId}`,
          });
        }
        return res.json({
          success: true,
          message: `Draft messages for chat ${chatId} synced`,
          drafts: filteredDrafts,
        });
      }
      return res.json({
        success: true,
        message: 'All draft messages synced',
        drafts,
      });
    } catch (error) {
      return next(error);
    }
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

export const updateChatPicture = catchAsync(async (req: any, res: Response) => {
  const { chatId } = req.params;

  if (!req.file) {
    throw new AppError('An error occured while uploading the story', 500);
  }

  await deleteChatPictureFile(chatId);

  await GroupChannel.findByIdAndUpdate(
    chatId,
    { photo: req.file.filename },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    status: 'success',
    message: 'chat picture updated successfuly',
    data: {},
  });
});
