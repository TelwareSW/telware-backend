import mongoose from 'mongoose';
import NormalChat from '@base/models/normalChatModel';
import Message from '@base/models/messageModel';
import { Socket } from 'socket.io';
import User from '@base/models/userModel';
import Chat from '@base/models/chatModel';

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
  const user = await User.findById(userId)
    .select('chats')
    .populate({
      path: 'chats.chat',
      match: type ? { type } : {},
    });
  if (!user) return [];
  return user.chats.filter((chatEntry) => chatEntry.chat !== null);
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

export const leaveGroupChannel = async (chatId: string, member: string) => {
  await Chat.updateOne(
    { _id: chatId },
    { $pull: { members: { user: member } } }
  );
};
