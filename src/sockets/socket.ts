import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import corsOptions from '@base/config/cors';
import registerChatHandlers from '@base/sockets/chat';
import { getAllChatIds } from '@services/chatService';
import mongoose from 'mongoose';
import { handleSendMessage, handleEditMessage } from './services';

const joinRooms = async (socket: Socket, userId: mongoose.Types.ObjectId) => {
  const chatIds = await getAllChatIds(userId);
  chatIds.forEach((chatId: mongoose.Types.ObjectId) => {
    socket.join(chatId.toString());
  });
};

const socketSetup = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: corsOptions,
  });
  io.on('connection', async (socket) => {
    console.log(`New client connected: ${socket.id}`);

    const userId = new mongoose.Types.ObjectId(); //TODO: Replace it with the actual userId
    await joinRooms(socket, userId);

    socket.on('SEND_MESSAGE', (data: any) => handleSendMessage(socket, data));
    socket.on('EDIT_MESSAGE', (data: any) => handleEditMessage(socket, data));
    socket.on('DELETE_MESSAGE', (data: any) => handleDeleteMessage(socket, data));
    registerChatHandlers(io, socket);
  });
};

export default socketSetup;
