import Chat from '@base/models/chatModel';
import mongoose from 'mongoose';
import GroupChannel from '@base/models/groupChannelModel';
import NormalChat from '@base/models/normalChatModel';
import IGroupChannel from '@base/types/groupChannel';
import INormalChat from '@base/types/normalChat';

export const getChats = async (
  userId: mongoose.Types.ObjectId,
  type: string
): Promise<any> => {
  const allChats = await Chat.find({ members: userId });
  let requiredChats;
  if (type === 'private') {
    requiredChats = allChats.filter((chat) => chat.type === 'private');
  } else if (type === 'group') {
    requiredChats = allChats.filter((chat) => chat.type === 'group');
  } else if (type === 'channel') {
    requiredChats = allChats.filter((chat) => chat.type === 'chat');
  } else return allChats;
};

export const getChatIds = async (
  userId: mongoose.Types.ObjectId,
  type: string
) => {
  const chats = await getChats(userId, type);
  return chats.map((chat: any) => chat._id);
};

export const createNewChat = async (
  data: any
): Promise<INormalChat | IGroupChannel> => {
  const { type, name, members } = data;
  let newChat: INormalChat | IGroupChannel;
  if (type && type === 'private') {
    newChat = new NormalChat({
      members,
    });
  } else {
    newChat = new GroupChannel({
      name,
      members,
    });
  }
  await newChat.save();
  return newChat;
};
