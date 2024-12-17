import { Socket } from 'socket.io';
import { getChatIds } from '@services/chatService';
import { Types } from 'mongoose';
import { getSocketsByUserId } from '@base/services/sessionService';
import User from '@base/models/userModel';
import GroupChannel from '@base/models/groupChannelModel';

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
  const { chatType, checkAdmin, newMessageIsReply } = additionalData;

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

  if (sender.Role !== 'admin' && chat.type !== 'private') {
    const groupChannelChat = await GroupChannel.findById(chat._id);

    if (!groupChannelChat.messagnigPermission)
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
};

export const informSessions = async (
  io: any,
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
  io: any,
  roomId: String,
  userId: Types.ObjectId
) => {
  const socketIds = await getSocketsByUserId(userId);
  socketIds.forEach((socketId: string) => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) socket.join(roomId);
  });
};

export const updateDraft = async (
  io: any,
  senderId: string,
  chatId: string,
  content: string
) => {
  await User.findByIdAndUpdate(
    senderId,
    { $set: { 'chats.$[chat].draft': content } },
    {
      arrayFilters: [{ 'chat.chat': chatId }],
    }
  );
  await informSessions(
    io,
    senderId,
    { chatId, draft: content },
    'UPDATE_DRAFT_SERVER'
  );
};

export const joinAllRooms = async (socket: Socket, userId: Types.ObjectId) => {
  const chatIds = await getChatIds(userId);
  chatIds.forEach((chatId: Types.ObjectId) => {
    socket.join(chatId.toString());
  });
};
