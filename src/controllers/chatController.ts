import AppError from '@base/errors/AppError';
import Chat from '@base/models/chatModel';
import GroupChannel from '@base/models/groupChannelModel';
import Message from '@base/models/messageModel';
import NormalChat from '@base/models/normalChatModel';
import User from '@base/models/userModel';
import {
  getChats,
  getLastMessage,
  leaveGroupChannel,
} from '@base/services/chatService';
import IUser from '@base/types/user';
import catchAsync from '@base/utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import mongoose, { ObjectId } from 'mongoose';
import redisClient from '@config/redis';

export const createChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, name, members } = req.body;
    const user: IUser = req.user as IUser;
    if (!user) return next(new AppError('you need to login first', 400));

    if (!process.env.GROUP_SIZE)
      return next(new AppError('define GROUP_SIZE in your .env file', 500));

    if (type === 'group' && members.length > process.env.GROUP_SIZE)
      return next(
        new AppError(
          `groups cannot have more than ${process.env.GROUP_SIZE} members`,
          400
        )
      );

    const membersWithRoles = members.map((id: ObjectId) => ({
      user: id,
      Role: 'member',
    }));
    const allMembers = [
      ...membersWithRoles,
      {
        user: user._id,
        Role: 'creator',
      },
    ];
    const newChat = new GroupChannel({
      name,
      type,
      members: allMembers,
    });
    await newChat.save();
    await Promise.all(
      allMembers.map((member) =>
        User.findByIdAndUpdate(
          member.user,
          { $push: { chats: { chat: newChat._id } } },
          { new: true }
        )
      )
    );
    await User.findById(allMembers[0].user);
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
    console.log(allChats);
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

export const deleteGroupChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat || chat.isDeleted)
      return next(new AppError('no chat found with the provided id', 400));

    chat.members = [];
    chat.isDeleted = true;
    await chat.save();

    res.status(204).json({
      status: 'success',
      message: 'chat deleted successfuly',
      data: {},
    });
  }
);

export const leaveChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user: IUser = req.user as IUser;
    const userId: string = user._id as string;
    leaveGroupChannel(req.params.id, userId);
    res.status(200).json({
      status: 'success',
      message: 'left the group successfuly',
      data: {},
    });
  }
);
