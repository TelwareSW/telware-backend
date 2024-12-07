import { Socket } from 'socket.io';
import Message from '@base/models/messageModel';
import { enableDestruction } from '@base/services/chatService';
import IMessage from '@base/types/message';
import redisClient from '@config/redis';
import NormalChat from '@base/models/normalChatModel';
import mongoose, { ObjectId } from 'mongoose';
import { getSocketsByUserId } from '@base/services/sessionService';
import User from '@base/models/userModel';
import Chat from '@base/models/chatModel';

interface Member {
  _id: mongoose.Types.ObjectId;
  Role: 'member' | 'admin' | 'creator';
}

const joinRoom = async (io: any, roomId: String, userId: ObjectId) => {
  const socketIds = await getSocketsByUserId(userId);
  socketIds.forEach((socketId: string) => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) socket.join(roomId);
  });
};

export const handleMessaging = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: String
) => {
  let { chatId, media, content, contentType, parentMessageId } = data;
  const { isFirstTime, chatType, isReply, isForward } = data;

  if (
    (!isForward &&
      !content &&
      !media &&
      (!contentType || !chatType || !chatId)) ||
    ((isReply || isForward) && !parentMessageId)
  )
    return ack({
      success: false,
      message: 'Failed to send the message',
      error: 'missing required Fields',
    });

  if (
    (isFirstTime && isReply) ||
    (isForward && (content || media || contentType))
  )
    return ack({
      success: false,
      message: 'Failed to send the message',
      error: 'conflicting fields',
    });

  if (isFirstTime) {
    const members = [{ user: chatId }, { user: senderId }];
    const chat = new NormalChat({ members });
    const id = String(chat._id);
    await chat.save();
    socket.join(id);
    await joinRoom(io, id, chatId);
    await User.findByIdAndUpdate(senderId, { chats: id });
    await User.findByIdAndUpdate(chatId, { chats: id });
    chatId = id;
  }

  let parentMessage;
  if (isForward || isReply) {
    parentMessage = (await Message.findById(parentMessageId)) as IMessage;
    if (!parentMessage)
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'No message found with the provided id',
      });

    if (!parentMessage)
      return ack({
        success: false,
        message: 'Failed to reply to the message',
        error: 'No message found with the provided parent message id',
      });

    if (isForward) {
      ({ content, contentType, media } = parentMessage);
      parentMessageId = undefined;
    }
  }

  const message = new Message({
    content,
    contentType,
    isForward,
    senderId,
    chatId,
    parentMessageId,
    messageType: chatType,
  });
  await message.save();

  if (parentMessage && isReply && chatType === 'channel') {
    parentMessage.threadMessages.push(message._id as mongoose.Types.ObjectId);
    await parentMessage.save();
  }

  const draftKey = `draft:${chatId}:${senderId}`;
  await redisClient.del(draftKey);

  socket.to(chatId).emit('RECEIVE_MESSAGE', message);
  const res = {
    messageId: message._id,
  };
  enableDestruction(socket, message, chatId);
  ack({ success: true, message: 'Message sent successfully', res });
};

export const handleEditMessage = async (
  socket: Socket,
  data: any,
  ack: Function
) => {
  const { messageId, content, chatId } = data;
  if (!messageId || !content)
    return ack({
      success: false,
      message: 'Failed to edit the message',
      error: 'missing required Fields',
    });
  const message = await Message.findByIdAndUpdate(
    messageId,
    { content },
    { new: true }
  );
  if (!message)
    return ack({
      success: false,
      message: 'Failed to edit the message',
      error: 'no message found with the provided id',
    });
  if (message.isForward)
    return ack({
      success: false,
      message: 'Failed to edit the message',
      error: 'cannot edit a forwarded message',
    });
  socket.to(chatId).emit('EDIT_MESSAGE_SERVER', message);
  ack({
    success: true,
    message: 'Message edited successfully',
    res: { message },
  });
};

export const handleDeleteMessage = async (
  socket: Socket,
  data: any,
  ack: Function
) => {
  const { messageId, chatId } = data;
  if (!messageId)
    return ack({
      success: false,
      message: 'Failed to delete the message',
      error: 'missing required Fields',
    });
  const message = await Message.findByIdAndDelete(messageId);
  if (!message)
    return ack({
      success: false,
      message: 'Failed to delete the message',
      error: 'no message found with the provided id',
    });
  socket.to(chatId).emit(messageId);
  ack({ success: true, message: 'Message deleted successfully' });
};

export const handleDraftMessage = async (
  socket: Socket,
  data: any,
  ack: Function,
  senderId: String
) => {
  try {
    const { chatId, content, contentType, isFirstTime, chatType } = data;

    // Store draft in Redis
    const draftKey = `draft:${chatId}:${senderId}`;
    const draftMessage = {
      content,
      contentType,
      chatId,
      isFirstTime,
      senderId,
      status: 'draft',
      chatType,
    };

    await redisClient.setEx(draftKey, 86400, JSON.stringify(draftMessage));

    // Emit the draft update to the client
    socket.emit('RECEIVE_DRAFT', draftMessage);

    const res = { messageId: draftKey };
    ack({ success: true, message: 'Draft saved', res });
  } catch (error) {
    ack({
      success: false,
      message: 'Failed to save the draft',
    });
  }
};

export const addAdminsHandler = async (
  io: any,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { members, chatId } = data;
  const chat = await Chat.findById(chatId);
  if (!chat) return ack({ success: false, message: 'provide the chatId' });
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
    m._id.equals(senderId)
  ) as unknown as Member;

  if (!admin || admin.Role === 'member')
    return ack({
      success: false,
      message: 'you do not have permission to add admins to the group',
    });

  let memId: mongoose.Types.ObjectId;
  let user;

  members.map(async (m: Member) => {
    memId = m._id;
    user = await User.findById(memId);
    if (!user)
      return ack({
        success: false,
        message: `member with Id: ${memId} does no longer exists`,
      });
    if (user.chats.includes(chatId))
      return ack({
        success: false,
        message: `member with Id: ${memId} is no longer a member of this chat`,
      });
    await Chat.updateOne(
      { _id: chatId, 'members._id': m._id },
      { $set: { 'members.$.Role': 'admin' } }
    );
    let memberSocket;
    const socketIds = await getSocketsByUserId(memId);
    if (socketIds.length !== 0)
      socketIds.forEach((socketId: any) => {
        memberSocket = io.sockets.sockets.get(socketId);
        memberSocket.emit('ADD_ADMIN_SERVER', chatId);
      });
  });

  ack({
    success: true,
    message: 'added admins successfuly',
  });
};
