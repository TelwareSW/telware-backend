import Chat from '@base/models/chatModel';
import mongoose from 'mongoose';
import GroupChannel from '@base/models/groupChannelModel';
import NormalChat from '@base/models/normalChatModel';
import IGroupChannel from '@base/types/groupChannel';
import INormalChat from '@base/types/normalChat';
import Message from '@base/models/messageModel';

export const getLastMessageInChat = async (
  chatId: string | mongoose.Types.ObjectId
) => {
  const latestMessage = await Message.findOne({ chatId }).sort({
    timestamp: -1,
  });

  if (!latestMessage) {
    return {};
  }

  return {
    lastMessage: latestMessage,
    lastMessageDate: latestMessage.timestamp,
  };
};

export const getChats = async (
  userId: mongoose.Types.ObjectId,
  type: string
): Promise<any> => {
  //populate to be moved for better performance
  const allChats = await Chat.find({ members: userId }).populate(
    'members',
    'username screenFirstName screenLastName phoneNumber photo status isAdmin stories blockedUsers'
  );

  const newChatsData = await Promise.all(
    allChats.map(async (chat) => {
      const additonalData = await getLastMessageInChat(chat.id);
      return {
        ...chat.toObject(),
        ...additonalData,
      };
    })
  );

  let requiredChats;
  if (type === 'private') {
    requiredChats = newChatsData.filter((chat) => chat.type === 'private');
  } else if (type === 'group') {
    requiredChats = newChatsData.filter((chat) => chat.type === 'group');
  } else if (type === 'channel') {
    requiredChats = newChatsData.filter((chat) => chat.type === 'channel');
  } else return newChatsData;

  return requiredChats;
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

export const enableDestruction = async (message: any, chatId: any) => {
  const chat = await NormalChat.findById(chatId);
  if (chat && chat.destructionDuration) {
    setTimeout(async () => {
      await Message.findByIdAndDelete(message._id);
    }, chat.destructionDuration * 1000);
  }
};
