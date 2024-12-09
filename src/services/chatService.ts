import mongoose from 'mongoose';
import NormalChat from '@base/models/normalChatModel';
import Message from '@base/models/messageModel';
import { Socket } from 'socket.io';
import User from '@base/models/userModel';
import fs from 'fs/promises';
import path from 'path';
import AppError from '@base/errors/AppError';
import GroupChannel from '@base/models/groupChannelModel';

export const getLastMessage = async (chats: any) => {
  const lastMessages = await Promise.all(
    chats.map(async (chat: any) => {
      const lastMessage = await Message.findOne({ chatId: chat.chat }).sort({
        timestamp: -1,
      });
      return {
        chatId: chat.chat._id,
        lastMessage,
      };
    })
  );
  return lastMessages;
};

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
      socket.to(chatId).emit('DESTRUCT_MESSAGE', messageId);
    }, chat.destructionDuration * 1000);
  }
};

export const deleteChatPictureFile = async (
  chatId: mongoose.Types.ObjectId | string
) => {
  const chat = await GroupChannel.findById(chatId);

  if (!chat) {
    throw new AppError('No Chat exists with this ID', 404);
  }

  const fileName = chat.picture;
  if (!fileName || !fileName.trim()) return;

  const filePath = path.join(process.cwd(), 'src/public/media/', fileName);

  try {
    // Check if the file exists
    await fs.access(filePath);
    // Delete the file if it exists
    await fs.unlink(filePath);
  } catch (err: any) {
    // Ignore file not found errors (ENOENT)
    if (err.code !== 'ENOENT') {
      throw err; // Rethrow unexpected errors
    }
  }
};
