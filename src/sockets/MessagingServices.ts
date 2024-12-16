import { Socket } from 'socket.io';
import { getChatIds } from '@services/chatService';
import { Types } from 'mongoose';
import { getSocketsByUserId } from '@base/services/sessionService';
import User from '@base/models/userModel';
import Chat from '@base/models/chatModel';

export interface Member {
  _id: Types.ObjectId;
  Role: 'member' | 'admin';
}

export const check = async (chatId: any, ack: Function, senderId: any) => {
  if (!chatId) {
    return ack({ success: false, message: 'provide the chatId' });
  }
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return ack({
      success: false,
      message: 'no chat found with the provided id',
    });
  }

  if (chat.type === 'private')
    return ack({
      success: false,
      message: 'this is a private chat!',
    });
  const chatMembers = chat.members;
  const chatMembersIds = chatMembers.map((m: any) => m._id);
  if (chatMembersIds.length === 0)
    return ack({
      success: false,
      message: 'this chat is deleted and it no longer exists',
    });

  const admin: Member = chatMembers.find((m) =>
    m.user.equals(senderId)
  ) as unknown as Member;

  if (!admin || admin.Role === 'member')
    return ack({
      success: false,
      message: 'you do not have permission',
    });
};

export const inform = async (io: any, userId: string, data: any, event: string) => {
  let memberSocket;
  const socketIds = await getSocketsByUserId(userId);
  if (!socketIds || socketIds.length !== 0)
    socketIds.forEach((socketId: any) => {
      memberSocket = io.sockets.sockets.get(socketId);
      if (memberSocket) memberSocket.emit(event, data);
    });
};

export const joinRoom = async (io: any, roomId: String, userId: Types.ObjectId) => {
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
  await inform(io, senderId, { chatId, draft: content }, 'UPDATE_DRAFT_SERVER');
};

export const joinAllRooms = async (
  socket: Socket,
  userId: Types.ObjectId
) => {
  const chatIds = await getChatIds(userId);
  chatIds.forEach((chatId: Types.ObjectId) => {
    socket.join(chatId.toString());
  });
};
