import { Socket } from 'socket.io';
import Message from '@base/models/messageModel';
import { createChat } from '@base/services/chatService';

export const handleSendMessage = async (socket: Socket, data: any) => {
  let { chatId } = data;
  const { content, contentType, senderId, isFirstTime } = data;
  let newChat;
  console.log(content, contentType);

  try {
    const message = new Message({
      content,
      contentType,
      chatId,
      senderId,
      status: 'sent',
    });
    await message.save();

    if (isFirstTime) {
      const members = [chatId, senderId];
      newChat = await createChat(members);

      chatId = newChat._id;
      socket.join(chatId);
    }
    socket.to(chatId).emit('RECEIVE_MESSAGE', message);
  } catch (error) {
    console.error('Error_SEND_MESSAGE:', error);
    socket.emit('ERROR', { message: 'Failed to send message.' });
  }
};

export const handleEditMessage = async (socket: Socket, data: any) => {
  const { messageId, content } = data;
  Message.findByIdAndUpdate(messageId, { content });


};


export const handleDeleteMessage = async (socket: Socket, data: any) => {
  const { messageId, deleteType } = data;
  if(deleteType === 'all')
    Message.findByIdAndDelete(messageId);
  
};
