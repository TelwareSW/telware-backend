import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import IMessage from '@base/types/message';
import Message from '@models/messageModel';
import NormalChat from '@models/normalChatModel';
import User from '@models/userModel';
import GroupChannel from '@models/groupChannelModel';
import { enableDestruction } from '@services/chatService';
import { joinRoom, updateDraft } from './MessagingServices';

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
    await User.findByIdAndUpdate(senderId, {
      $push: {
        chats: { chat: id },
      },
    });
    await User.findByIdAndUpdate(chatId, {
      $push: {
        chats: { chat: id },
      },
    });
    chatId = id;
  }

  if (chatType !== 'private') {
    const chat = await GroupChannel.findById(chatId);
    if (!chat)
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'this chat does not exist',
      });
    const sender = chat.members.find((member: any) =>
      member.user.equals(senderId)
    );
    console.log(sender);
    if (!sender)
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'you are not a member of this chat',
      });
    if (sender.Role !== 'admin' && !chat.messagnigPermission)
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'only admins can post and reply to this chat',
      });
    if (sender.Role !== 'admin' && !isReply && chatType === 'channel')
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'only admins can post to this channel',
      });
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
