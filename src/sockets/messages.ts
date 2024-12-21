import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import IMessage from '@base/types/message';
import Message from '@models/messageModel';
import { enableDestruction } from '@services/chatService';
import Chat from '@base/models/chatModel';
import { check, updateDraft } from './MessagingServices';
import {detectInappropriateContent} from '@services/googleAIService';
import GroupChannel from '@base/models/groupChannelModel';
import { group } from 'console';
interface PinUnPinMessageData {
  chatId: string | Types.ObjectId;
  messageId: string | Types.ObjectId;
}

export const handleMessaging = async (
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
  if (func) return func;

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
  let isAppropriate = true;
  console.log(chatType, chatId)
  const g= await GroupChannel.findById(chatId);
  console.log(g);
  console.log(g.isFilterd);
  if ((chatType === 'group' || chatType==='channel') && g.isFilterd===true) {
    console.log("innnnnnnnnnnnnn")
  isAppropriate = await detectInappropriateContent(content);
  }
  const message = new Message({
    content,
    contentType,
    isForward,
    senderId,
    chatId,
    parentMessageId,
    isAppropriate, // Set the isAppropriate property based on the content check
  });
  
  console.log(message);
  await message.save();

  if (parentMessage && isReply && chatType === 'channel') {
    parentMessage.threadMessages.push(message._id as Types.ObjectId);
    await parentMessage.save();
  }

  await updateDraft(io, senderId, chatId, '');
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
  socket.to(chatId).emit('DELETE_MESSAGE_SERVER', messageId);
  ack({ success: true, message: 'Message deleted successfully' });
};

async function handlePinMessage(socket: Socket, data: PinUnPinMessageData) {
  try {
    // Make a message pinned
    const message = await Message.findById(data.messageId);
    if (!message) {
      //TODO: Make a global socket event for the client to send errors to
      return;
    }

    message.isPinned = true;
    await message.save();

    // Send an event to all online chat users to pin a message.
    socket.to(data.chatId.toString()).emit('PIN_MESSAGE_SERVER', data);
  } catch (err) {
    //TODO: Make a global socket event for the client to send errors to
  }
}

async function handleUnPinMessage(socket: Socket, data: PinUnPinMessageData) {
  try {
    // Make a message unpinned
    const message = await Message.findById(data.messageId);
    if (!message) {
      //TODO: Make a global socket event for the client to send errors to
      return;
    }

    message.isPinned = false;
    await message.save();

    // Send an event to all online chat users to unpin a message.
    socket.to(data.chatId.toString()).emit('UNPIN_MESSAGE_SERVER', data);
  } catch (err) {
    //TODO: Make a global socket event for the client to send errors to
  }
}

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

  socket.on('PIN_MESSAGE_CLIENT', (data: PinUnPinMessageData) =>
    handlePinMessage(socket, data)
  );

  socket.on('UNPIN_MESSAGE_CLIENT', (data: PinUnPinMessageData) =>
    handleUnPinMessage(socket, data)
  );
}

export default registerMessagesHandlers;
