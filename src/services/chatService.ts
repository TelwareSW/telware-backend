import mongoose from 'mongoose';
import NormalChat from '@base/models/normalChatModel';
import Message from '@base/models/messageModel';
import { Server, Socket } from 'socket.io';
import User from '@base/models/userModel';
import AppError from '@base/errors/AppError';
import GroupChannel from '@base/models/groupChannelModel';
import deleteFile from '@base/utils/deleteFile';
import { informSessions } from '@base/sockets/MessagingServices';

export const getLastMessage = async (chats: any) => {
  const lastMessages = await Promise.all(
    chats.map(async (chat: any) => {
      const lastMessage = await Message.findOne({ chatId: chat.chat._id }).sort(
        {
          timestamp: -1,
        }
      );
      return {
        chatId: chat.chat._id,
        lastMessage,
      };
    })
  );
  return lastMessages;
};

export const getUnreadMessages = async (chats: any, user: any) =>
  Promise.all(
    chats.map(async (chat: any) => ({
      chatId: chat.chat._id,
      unreadMessagesCount: await Message.countDocuments({
        chatId: chat.chat._id,
        readBy: { $nin: [user._id] },
      }),
      isMentioned:
        (await Message.exists({
          chatId: chat.chat._id,
          readBy: { $nin: [user._id] },
          senderId: { $ne: user._id },
          content: new RegExp(`@${user.username}`, 'i'),
        })) !== null,
    }))
  );

export const getChats = async (
  userId: mongoose.Types.ObjectId,
  type?: string
): Promise<any> => {
  const userChats = await User.findById(userId)
    .select('chats')
    .populate({
      path: 'chats.chat',
      match: type ? { type } : {},
    });
  if (!userChats) return [];
  return userChats.chats.filter((chat) => chat.chat !== null);
};

export const getChatIds = async (
  userId: mongoose.Types.ObjectId,
  type?: string
) => {
  const chats = await getChats(userId, type);
  return chats.map((chat: any) => chat.chat._id);
};

export const enableDestruction = async (
  socket: Socket,
  message: any,
  chatId: any
) => {
  const chat = await NormalChat.findById(chatId);
  const messageId = message._id;
  if (chat && chat.destructionDuration) {
    setTimeout(async () => {
      await Message.findByIdAndDelete(messageId);
      socket.to(chatId).emit('DELETE_MESSAGE_SERVER', messageId);
    }, chat.destructionDuration * 1000);
  }
};

export const muteUnmuteChat = async (
  io: Server,
  userId: string,
  chatId: string,
  event: string,
  muteDuration?: number
) => {
  User.findByIdAndUpdate(
    userId,
    {
      $set: {
        'chats.$[elem].isMuted': muteDuration,
        'chats.$[elem].muteDuration': muteDuration,
      },
    },
    {
      arrayFilters: [{ 'elem.chat': chatId }],
    }
  );
  informSessions(io, userId, { chatId }, event);
};

export const deleteChatPictureFile = async (
  chatId: mongoose.Types.ObjectId | string
) => {
  const chat = await GroupChannel.findById(chatId);

  if (!chat) {
    throw new AppError('No Chat exists with this ID', 404);
  }

  const fileName = chat.picture;
  await deleteFile(fileName);
};
