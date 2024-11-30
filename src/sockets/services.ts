import { Socket } from 'socket.io';
import Message from '@base/models/messageModel';
import { createNewChat, enableDestruction } from '@base/services/chatService';
import NormalMessage from '@base/models/normalMessageModel';
import IMessage from '@base/types/message';
import ChannelMessage from '@base/models/channelMessageModel';
import redisClient from '@config/redis';

//TODO: handle the case where the user is not joined to the room and still tries to send a message
export const handleDraftMessage = async (
  socket: Socket,
  data: any,
  func: Function
) => {
  try {
    const { chatId, senderId, content, contentType, isFirstTime, chatType } = data;

    // Store draft in Redis
    const draftKey = `draft:${chatId}:${senderId}`;
    const draftMessage = { content, contentType, chatId,isFirstTime,senderId, status: 'draft', chatType };

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

// handleSendMessage function
export const handleSendMessage = async (
  socket: Socket,
  data: any,
  func: Function
) => {
  let { chatId } = data;
  const { content, contentType, senderId, isFirstTime, chatType } = data;
  let newChat;
  if (!content || !contentType || !senderId || !chatType || !chatId)
    return func({
      success: false,
      message: 'Failed to send the message',
      error: 'missing required Fields',
    });

  //TODO: to be edited when handling the sessions
  if (isFirstTime) {
    const members = [chatId, senderId];
    newChat = await createNewChat(members);
    chatId = newChat._id;
    socket.join(chatId);
  }
  let message;
  if (chatType === 'private' || chatType === 'group')
    message = new NormalMessage({
      content,
      contentType,
      chatId,
      senderId,
      status: 'sent',
    });
  else
    message = new ChannelMessage({
      content,
      contentType,
      chatId,
      senderId,
      status: 'sent',
    });
    const draftKey = `draft:${chatId}:${senderId}`;
    await redisClient.del(draftKey); 
  await message.save();
  socket.to(chatId).emit('RECEIVE_MESSAGE', message);
  const res = {
    messageId: message._id,
  };
  func({ success: true, message: 'Message sent successfully', res });
};

export const handleEditMessage = async (data: any, func: Function) => {
  const { messageId, content } = data;
  if (!messageId || !content)
    return func({
      success: false,
      message: 'Failed to edit the message',
      error: 'missing required Fields',
    });
  const message = await Message.findByIdAndUpdate(messageId, { content });
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
  func({
    success: true,
    message: 'Message edited successfully',
    res: { message },
  });
};

export const handleDeleteMessage = async (data: any, func: Function) => {
  const { messageId } = data;
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
  let forwardMessage;

  if (chatType === 'private' || chatType === 'group')
    forwardMessage = new NormalMessage({
      content: message.content,
      contentType: message.contentType,
      isForward: true,
      senderId,
      chatId,
    });
  else
    forwardMessage = new ChannelMessage({
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

  const reply = new NormalMessage({
    content,
    contentType,
    isReply: true,
    senderId,
    chatId,
    parentMessage: parentMessageId,
  });
  await reply.save();

  if (chatType === 'channel') {
    const parentChannelMessage = await ChannelMessage.findById(parentMessageId);
    if (!parentChannelMessage)
      return func({
        success: false,
        message: 'Failed to reply to the message',
        error: 'No message found with the provided parent message id',
      });
    parentChannelMessage.threadMessages.push(reply._id);
    await parentChannelMessage.save();
  } else {
    const parentMessage = await NormalMessage.findById(parentMessageId);
    if (!parentMessage)
      return func({
        success: false,
        message: 'Failed to reply to the message',
        error: 'No message found with the provided parent message id',
      });
  }
  socket.to(chatId).emit('RECEIVE_REPLY', reply);
  const res = {
    messageId: reply._id,
  };
  func({ success: true, message: 'Reply sent successfully', res });
};
