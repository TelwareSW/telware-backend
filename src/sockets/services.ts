import { Socket } from 'socket.io';
import Message from '@base/models/messageModel';
import { createChat } from '@base/services/chatService';
import NormalMessage from '@base/models/channelMessageModel';

export const handleSendMessage = async (socket: Socket, data: any) => {
  let { chatId } = data;
  const { content, contentType, senderId, isFirstTime } = data;
  let newChat;

  try {
    if (isFirstTime) {
      const members = [chatId, senderId];
      newChat = await createChat(members);

      chatId = newChat._id;
      socket.join(chatId);
    } //TODO: to be edited when implementing channel and group messages based on the message type
    const message = new NormalMessage({
      content,
      contentType,
      chatId,
      senderId,
      status: 'sent',
    });
    await message.save();

    socket.to(chatId).emit('RECEIVE_MESSAGE', message);
  } catch (error) {
    console.error('Error_SEND_MESSAGE:', error);
    socket.emit('ERROR', { message: 'Failed to send message.' });
  }
};

export const handleEditMessage = async (data: any) => {
  const { messageId, content } = data;
  await Message.findByIdAndUpdate(messageId, { content });
};

export const handleDeleteMessage = async (data: any) => {
  const { messageId, deleteType } = data;
  if (deleteType === 'all') await Message.findByIdAndDelete(messageId);
};

export const handleForwardMessage = async (socket: Socket, data: any) => {
  const { chatId, messageId, senderId } = data;
  const message = Message.findById(messageId);
  const forwardMessage = new NormalMessage({
    content: message.content,
    contentType: message.contentType,
    isForward: true,
    senderId,
    chatId,
  });
  socket.to(chatId).emit('RECEIVE_MESSAGE', forwardMessage);
};
