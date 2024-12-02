import { Socket } from 'socket.io';
import Message from '@base/models/messageModel';
import { enableDestruction } from '@base/services/chatService';
import IMessage from '@base/types/message';
import redisClient from '@config/redis';
import NormalChat from '@base/models/normalChatModel';
import mongoose, { ObjectId } from 'mongoose';
import { getSocketsByUserId } from '@base/services/sessionService';

const joinRoom = (io: any, roomId: String, userId: ObjectId) => {
  const socketIds = getSocketsByUserId(userId);
  socketIds.forEach((socketId: string) => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) socket.join(roomId);
  });
};

export const handleDraftMessage = async (
  socket: Socket,
  data: any,
  func: Function
) => {
  try {
    const { chatId, senderId, content, contentType, isFirstTime, chatType } =
      data;

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
    func({ success: true, message: 'Draft saved', res });
  } catch (error) {
    func({
      success: false,
      message: 'Failed to save the draft',
    });
  }
};

export const handleSendMessage = async (
  io: any,
  socket: Socket,
  data: any,
  func: Function
) => {
  let { chatId } = data;
  const { media, content, contentType, senderId, isFirstTime, chatType } = data;
  if ((!content && !media) || !contentType || !senderId || !chatType || !chatId)
    return func({
      success: false,
      message: 'Failed to send the message',
      error: 'missing required Fields',
    });

  if (isFirstTime) {
    const members = [chatId, senderId];
    const chat = new NormalChat({ members });
    const id = String(chat._id);
    await chat.save();
    chatId = id;
    socket.join(id);
    joinRoom(io, chatId, chatId);
  }
  const message = new Message({
    content,
    contentType,
    chatId,
    senderId,
    messageType: chatType,
    media,
  });
  await message.save();

  const draftKey = `draft:${chatId}:${senderId}`;
  await redisClient.del(draftKey);

  socket.to(chatId).emit('RECEIVE_MESSAGE', message);
  const res = {
    messageId: message._id,
  };
  enableDestruction(socket, message, chatId);
  func({ success: true, message: 'Message sent successfully', res });
};

export const handleEditMessage = async (
  socket: Socket,
  data: any,
  func: Function
) => {
  const { messageId, content, chatId } = data;
  if (!messageId || !content)
    return func({
      success: false,
      message: 'Failed to edit the message',
      error: 'missing required Fields',
    });
  const message = await Message.findByIdAndUpdate(
    messageId,
    { content },
    { new: true }
  );
  console.log(message);
  if (!message)
    return func({
      success: false,
      message: 'Failed to edit the message',
      error: 'no message found with the provided id',
    });
  if (message.isForward)
    return func({
      success: false,
      message: 'Failed to edit the message',
      error: 'cannot edit a forwarded message',
    });
  socket.to(chatId).emit('EDIT_MESSAGE_SERVER', message);
  func({
    success: true,
    message: 'Message edited successfully',
    res: { message },
  });
};

export const handleDeleteMessage = async (
  socket: Socket,
  data: any,
  func: Function
) => {
  const { messageId, chatId } = data;
  if (!messageId)
    return func({
      success: false,
      message: 'Failed to delete the message',
      error: 'missing required Fields',
    });
  const message = await Message.findByIdAndDelete(messageId);
  if (!message)
    return func({
      success: false,
      message: 'Failed to delete the message',
      error: 'no message found with the provided id',
    });
  socket.to(chatId).emit(messageId);
  func({ success: true, message: 'Message deleted successfully' });
};

export const handleForwardMessage = async (
  socket: Socket,
  data: any,
  func: Function
) => {
  const { chatId, messageId, senderId, chatType } = data;
  if (!senderId || !chatType || !chatId || !messageId)
    return func({
      success: false,
      message: 'Failed to send the message',
      error: 'missing required Fields',
    });
  const message = (await Message.findById(messageId)) as IMessage;
  if (!message)
    return func({
      success: false,
      message: 'Failed to forward the message',
      error: 'No message found with the provided id',
    });
  const forwardMessage = new Message({
    content: message.content,
    contentType: message.contentType,
    isForward: true,
    senderId,
    chatId,
  });
  await forwardMessage.save();
  socket.to(chatId).emit('RECEIVE_MESSAGE', forwardMessage);
  const res = {
    messageId: forwardMessage._id,
  };
  func({ success: true, message: 'Message forwarded successfully', res });
};

export const handleReplyMessage = async (
  socket: Socket,
  data: any,
  func: Function
) => {
  const { chatId, content, contentType, senderId, parentMessageId, chatType } =
    data;
  if (
    !content ||
    !contentType ||
    !senderId ||
    !chatId ||
    !parentMessageId ||
    !chatType
  )
    return func({
      success: false,
      message: 'Failed to send the message',
      error: 'missing required Fields',
    });

  const reply = new Message({
    content,
    contentType,
    isReply: true,
    senderId,
    chatId,
    parentMessage: parentMessageId,
    messageType: chatType,
  });
  await reply.save();
  const replyId = reply._id as mongoose.Types.ObjectId;
  const parentChannelMessage = await Message.findById(parentMessageId);
  if (!parentChannelMessage)
    return func({
      success: false,
      message: 'Failed to reply to the message',
      error: 'No message found with the provided parent message id',
    });
  if (chatType === 'channel') parentChannelMessage.threadMessages.push(replyId);
  await parentChannelMessage.save();

  socket.to(chatId).emit('RECEIVE_REPLY', reply);
  const res = {
    messageId: reply._id,
  };
  func({ success: true, message: 'Reply sent successfully', res });
};
