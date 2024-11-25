import Chat from '@base/models/chatModel';
import IChat from '@base/types/chat';
import mongoose from 'mongoose';

export const getAllChatIds = async (userId: mongoose.Types.ObjectId): Promise<any> => {
  const chats = await Chat.find({ members: userId }).select('_id');
  return chats.map((chat) => chat._id);
};

export const createChat = async (data: any): Promise<IChat> => {
  const { memberIds } = data;
  const newChat = new Chat({
    isSeen: true,
    members: memberIds,
  });
  await newChat.save();
  return newChat;
};
