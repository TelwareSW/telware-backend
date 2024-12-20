import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import IMessage from '@base/types/message';
import Message from '@models/messageModel';
import { enableDestruction } from '@services/chatService';
import Chat from '@base/models/chatModel';
import { check, informSessions, updateDraft } from './MessagingServices';

interface PinUnPinMessageData {
  chatId: string | Types.ObjectId;
  messageId: string | Types.ObjectId;
}

const handleMessaging = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: string
) => {
  let { media, content, contentType, parentMessageId } = data;
  const { chatId, chatType, isReply, isForward } = data;
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

  if (isForward && (content || media || contentType))
    return ack({
      success: false,
      message: 'Failed to send the message',
      error: 'conflicting fields',
    });

  const chat = await Chat.findById(chatId);
  const func = await check(chat, ack, senderId, {
    newMessageIsReply: isReply,
  });
  if (!func) return;

  let parentMessage;
  if (isForward || isReply) {
    parentMessage = (await Message.findById(parentMessageId)) as IMessage;
    if (!parentMessage)
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'No message found with the provided id',
      });

    if (isForward) {
      ({ content, contentType, media } = parentMessage);
      parentMessageId = undefined;
    }
  }

  const message = new Message({
    media,
    content,
    contentType,
    isForward,
    senderId,
    chatId,
    parentMessageId,
  });
  await message.save();
  if (parentMessage && isReply && chatType === 'channel') {
    parentMessage.threadMessages.push(message._id as Types.ObjectId);
    await parentMessage.save();
  }

  await updateDraft(io, senderId, chatId, '');
  socket.to(chatId).emit('RECEIVE_MESSAGE', message, async (res: any) => {
    if (res.success) {
      if (res.isRead) message.readBy.push(res.userId);
      else message.deliveredTo.push(res.userId);
      message.save();
      informSessions(
        io,
        senderId,
        message,
        res.isRead ? 'MESSAGE_READ_SERVER' : 'MESSAGE_DELIVERED'
      );
    }
  });
  const res = {
    messageId: message._id,
  };
  enableDestruction(socket, message, chatId);
  ack({ success: true, message: 'Message sent successfully', res });
};

const handleEditMessage = async (socket: Socket, data: any, ack: Function) => {
  const { messageId, content, chatId } = data;
  if (!messageId || !content)
    return ack({
      success: false,
      message: 'Failed to edit the message',
      error: 'missing required Fields',
    });
  const message = await Message.findByIdAndUpdate(
    messageId,
    { content, isEdited: true },
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

const handleDeleteMessage = async (
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
  socket.to(chatId).emit('DELETE_MESSAGE_SERVER', message);
  ack({ success: true, message: 'Message deleted successfully' });
};

const handleReadMessage = async (
  io: Server,
  socket: Socket,
  data: any,
  ack: Function,
  userId: string
) => {
  const { chatId } = data;
  const messages = await Message.find({
    chatId,
    senderId: { $ne: userId },
    readBy: { $nin: [userId] },
  });
  if (!messages)
    return ack({
      success: true,
      message: 'No messages to read',
    });
  messages.forEach(async (message: IMessage) => {
    message.deliveredTo = message.deliveredTo.filter(
      (id) => id.toString() !== userId
    );
    message.readBy.push(new Types.ObjectId(userId));
    message.save();
    informSessions(
      io,
      message.senderId.toString(),
      message,
      'MESSAGE_READ_SERVER'
    );
  });
  ack({ success: true, message: 'Message read successfully' });
};

const handlePinMessage = async (
  socket: Socket,
  data: PinUnPinMessageData,
  ack: Function
) => {
  const message = await Message.findById(data.messageId);
  if (!message) {
    return ack({ success: false, message: 'Failed to pin message' });
  }

  message.isPinned = true;
  await message.save();

  socket.to(data.chatId.toString()).emit('PIN_MESSAGE_SERVER', data);
  ack({ success: true, message: 'Message pinned successfully' });
};

const handleUnPinMessage = async (
  socket: Socket,
  data: PinUnPinMessageData,
  ack: Function
) => {
  const message = await Message.findById(data.messageId);
  if (!message) {
    return ack({ success: false, message: 'Failed to unpin message' });
  }

  message.isPinned = false;
  await message.save();

  socket.to(data.chatId.toString()).emit('UNPIN_MESSAGE_SERVER', data);
  ack({ success: true, message: 'Message unpinned successfully' });
};

async function registerMessagesHandlers(
  io: Server,
  socket: Socket,
  userId: string
) {
  socket.on('SEND_MESSAGE', (data: any, ack: Function) =>
    handleMessaging(io, socket, data, ack, userId)
  );

  socket.on('EDIT_MESSAGE_CLIENT', (data: any, ack: Function) =>
    handleEditMessage(socket, data, ack)
  );

  socket.on('DELETE_MESSAGE_CLIENT', (data: any, ack: Function) =>
    handleDeleteMessage(socket, data, ack)
  );

  socket.on('MESSAGE_READ_CLIENT', (data: any, ack: Function) => {
    handleReadMessage(io, socket, data, ack, userId);
  });

  socket.on('PIN_MESSAGE_CLIENT', (data: PinUnPinMessageData, ack: Function) =>
    handlePinMessage(socket, data, ack)
  );

  socket.on(
    'UNPIN_MESSAGE_CLIENT',
    (data: PinUnPinMessageData, ack: Function) =>
      handleUnPinMessage(socket, data, ack)
  );
}

export default registerMessagesHandlers;
