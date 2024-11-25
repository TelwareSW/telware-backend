import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import corsOptions from '@base/config/cors';
import registerChatHandlers from '@base/sockets/chat';
import { getAllChatIds } from '@services/chatService';
import mongoose from 'mongoose';
import { handleReceiveMessage, handleSendMessage } from './services';

const socketSetup = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connection', async (socket) => {
    console.log(`New client connected: ${socket.id}`);

    const userId = new mongoose.Types.ObjectId(); //TODO: Replace it with the actual userId
    const chatIds = await getAllChatIds(userId);

    chatIds.forEach((chatId: mongoose.Types.ObjectId) => {
      socket.join(chatId.toString());
    });

    socket.on('SEND_MESSAGE', (message) =>
      handleSendMessage(io, socket, message)
    );

    socket.on('RECEIVE_MESSAGE', () => handleReceiveMessage());

    registerChatHandlers(io, socket);
  });
};

export default socketSetup;
