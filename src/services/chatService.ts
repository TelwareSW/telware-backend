import Chat from '@base/models/chatModel';
import mongoose from 'mongoose';
import GroupChannel from '@base/models/groupChannelModel';
import NormalChat from '@base/models/normalChatModel';
import IGroupChannel from '@base/types/groupChannel';
import INormalChat from '@base/types/normalChat';
import Message from '@base/models/messageModel';
import { Socket } from 'socket.io';

export const getLastMessage = async (chats: any) => {
  const lastMessages = await Promise.all(
    chats.map(async (chat: any) => {
      const lastMessage = await Message.findOne({ chatId: chat._id })
        .sort({ timestamp: -1 })
        .select('content senderId timestamp');
      return {
        chatId: chat._id,
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
  let chats;
  if (!type) chats = await Chat.find({ members: userId });
  else chats = await Chat.find({ members: userId, type });
  return chats;
};

export const getChatIds = async (
  userId: mongoose.Types.ObjectId,
  type?: string
) => {
  const chats = await getChats(userId, type);
  return chats.map((chat: any) => chat._id);
};

export const createNewChat = async (
  data: any
): Promise<INormalChat | IGroupChannel> => {
  const { name, members } = data;
  const newChat = new GroupChannel({
    name,
    members,
  });
  await newChat.save();
  return newChat;
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
