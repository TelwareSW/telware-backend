import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { getChatIds } from '@services/chatService';
import { getSocketsByUserId } from '@services/sessionService';
import User from '@models/userModel';
import GroupChannel from '@models/groupChannelModel';
import Message from '@models/messageModel';
import IMessage from '@base/types/message';
import detectInappropriateContent from '@base/services/googleAIService';

export interface Member {
  user: Types.ObjectId;
  Role: 'member' | 'admin';
}

export const check = async (
  chat: any,
  ack: Function,
  senderId: any,
  additionalData?: any
) => {
  const { chatType, checkAdmin, newMessageIsReply, content, sendMessage } =
    additionalData;

  if (!chat || chat.isDeleted) {
    return ack({
      success: false,
      message: 'Chat not found',
    });
  }

  const chatMembers = chat.members;
  if (chatMembers.length === 0)
    return ack({
      success: false,
      message: 'this chat is deleted and it no longer exists',
    });

  const sender: Member = chatMembers.find((m: Member) =>
    m.user.equals(senderId)
  ) as unknown as Member;

  if (!sender)
    return ack({
      success: false,
      message: 'you are not a member of this chat',
    });

  if (chatType && !chatType.includes(chat.type))
    return ack({
      success: false,
      message: `this is a ${chat.type} chat!`,
    });

  if (checkAdmin && sender.Role !== 'admin')
    return ack({
      success: false,
      message: 'you do not have permission as you are not an admin',
    });

  if (sendMessage && chat.type !== 'private') {
    const groupChannelChat = await GroupChannel.findById(chat._id);
    if (
      chat?.type === 'group' &&
      chat.isFilterd &&
      (await detectInappropriateContent(content))
    )
      return 'inappropriate';
    if (sender.Role !== 'admin') {
      if (!groupChannelChat.messagingPermission)
        return ack({
          success: false,
          message: 'only admins can post and reply to this chat',
        });
      if (chat.type === 'channel' && !newMessageIsReply)
        return ack({
          success: false,
          message: 'only admins can post to this channel',
        });
    }
  }
  return 'ok';
};

export const informSessions = async (
  io: Server,
  userId: string,
  data: any,
  event: string
) => {
  let memberSocket;
  const socketIds = await getSocketsByUserId(userId);
  if (!socketIds || socketIds.length !== 0)
    socketIds.forEach((socketId: any) => {
      memberSocket = io.sockets.sockets.get(socketId);
      if (memberSocket) memberSocket.emit(event, data);
    });
};

export const joinRoom = async (
  io: Server,
  roomId: String,
  userId: Types.ObjectId
) => {
  const socketIds = await getSocketsByUserId(userId);
  socketIds.forEach(async (socketId: string) => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) socket.join(roomId.toString());
  });
};

export const updateDraft = async (
  io: Server,
  senderId: string,
  chatId: string,
  content: string
) => {
  User.findByIdAndUpdate(
    senderId,
    { $set: { 'chats.$[chat].draft': content } },
    {
      arrayFilters: [{ 'chat.chat': chatId }],
    }
  );
  informSessions(
    io,
    senderId,
    { chatId, draft: content },
    'UPDATE_DRAFT_SERVER'
  );
};

export const joinAllRooms = async (socket: Socket, userId: Types.ObjectId) => {
  const chatIds = await getChatIds(userId);
  chatIds.forEach(async (chatId: Types.ObjectId) => {
    socket.join(chatId.toString());
  });
};

export const deliverMessages = async (
  io: Server,
  socket: Socket,
  userId: Types.ObjectId
) => {
  const user = await User.findById(userId);
  if (!user) return;

  const messages = await Message.find({
    chatId: { $in: user.chats.map((chat: any) => chat.chat) },
    senderId: { $ne: userId },
    deliveredTo: { $nin: [userId] },
    readBy: { $nin: [userId] },
  });

  Promise.all(
    messages.map(async (message: IMessage) => {
      message.deliveredTo.push(userId);
      message.save();
      informSessions(
        io,
        message.senderId.toString(),
        message,
        'MESSAGE_DELIVERED'
      );
    })
  );
};
