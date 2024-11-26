import Chat from '@base/models/chatModel';
import mongoose from 'mongoose';
import GroupChannel from '@base/models/groupChannelModel';
import NormalChat from '@base/models/normalChat';

export const getChats = async (
  userId: mongoose.Types.ObjectId,
  type: any
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

export const createNewChat = async (data: any) => {
  const { type, name, members } = data;
  let newChat;
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
};
