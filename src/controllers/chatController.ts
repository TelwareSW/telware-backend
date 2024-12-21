import AppError from '@base/errors/AppError';
import Chat from '@base/models/chatModel';
import Message from '@base/models/messageModel';
import User from '@base/models/userModel';
import {
  getChats,
  getLastMessage,
  deleteChatPictureFile,
  getUnreadMessages,
} from '@base/services/chatService';
import IUser from '@base/types/user';
import catchAsync from '@base/utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import GroupChannel from '@base/models/groupChannelModel';
import crypto from 'crypto';
import Invite from '@base/models/inviteModel';
import VoiceCall from '@base/models/voiceCallModel';

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

    const [members, lastMessages, unreadMessages] = await Promise.all([
      User.find(
        { _id: { $in: memberIds } },
        'username screenFirstName screenLastName phoneNumber photo status isAdmin stories blockedUsers'
      ),
      getLastMessage(allChats),
      getUnreadMessages(allChats, userId),
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Chats retrieved successfuly',
      data: { chats: allChats, members, lastMessages, unreadMessages },
    });
  }
);

export const getMessages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;

    const pageByMsgId = req.query.page === '0' ? undefined : req.query.page;
    const limit: number = parseInt(req.query.limit as string, 10) || 20;
    const filter: any = { chatId };
    if (req.query.timestamp) {
      filter.timestamp = { $gte: req.query.timestamp };
    }
    else if (pageByMsgId) {
      const message = await Message.findById(pageByMsgId);
      filter.timestamp = { $lt: message.timestamp };
    }

    const messages = await Message.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);

    if (!messages || messages.length === 0) {
      return next(new AppError('No messages found', 404));
    }

    messages.reverse();
    const nextPage = messages.length < limit ? undefined : messages[0]._id;

    res.status(200).json({
      status: 'success',
      message: 'messages retreived successfuly',
      data: { messages, nextPage },
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

export const invite = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { expiresIn } = req.body;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const invitation = await Invite.create({
      token,
      chatId: req.params.chatId,
      expiresIn: expiresAt,
    });
    await invitation.save();
    const invitationLink = `${req.protocol}://${req.get('host')}/api/v1/chats/join/${token}`;
    res.status(201).json({
      status: 'success',
      message: 'invitation link is created successfuly',
      data: {
        invitationLink,
        expiresAt,
      },
    });
  }
);

export const join = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const user: IUser = req.user as IUser;
    const userId = user._id as mongoose.Types.ObjectId;
    const invitation = await Invite.findOne({ token });
    if (!invitation || invitation.expiresIn < new Date())
      return next(new AppError('Invalid or expired invite', 400));

    const chat = await Chat.findById(invitation.chatId);
    if (!chat) return next(new AppError('this chat does no longer exist', 400));
    const isMember = chat.members.some((member: any) =>
      member.user.equals(userId)
    );
    if (isMember) return next(new AppError('you are already a member', 400));

    chat.members.push({ user: userId, Role: 'member' });
    await chat.save();

    const wasMember = user.chats.some((c: any) => c.chat.equals(chat._id));
    if (!wasMember)
      await User.findByIdAndUpdate(userId, {
        $push: { chats: { chat: chat._id } },
      });

    res.status(200).json({
      status: 'success',
      message: 'joined chat successfuly',
      data: {},
    });
  }
);

export const getVoiceCallsInChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;

    const voiceCalls = await VoiceCall.find({ chatId });

    res.status(200).json({
      status: 'success',
      message: 'voice calls retrieved successfuly',
      data: {
        voiceCalls,
      },
    });
  }
);
export const filterChatGroups = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const groupChannel = await GroupChannel.findById(chatId);
    if (!groupChannel) {
      return res.status(404).json({
        status: 'fail',
        message: 'Group/Channel not found with the given chatId',
      });
    }

    groupChannel.isFilterd = true;
    res.status(200).json({
      status: 'success',
      message: 'isFiltered set to true successfully',
      data: groupChannel,
    });
  }
);
export const unfilterChatGroups = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;

    const groupChannel = await GroupChannel.findById(chatId);

    if (!groupChannel) {
      return res.status(404).json({
        status: 'fail',
        message: 'GroupChannel not found with the given chatId',
      });
    }
    groupChannel.isFilterd = false;

    res.status(200).json({
      status: 'success',
      message: 'isFiltered set to true successfully',
      data: groupChannel,
    });
  }
);
