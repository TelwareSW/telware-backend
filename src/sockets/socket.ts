import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import corsOptions from '@base/config/cors';
import registerChatHandlers from '@base/sockets/chat';
import { getChatIds } from '@services/chatService';
import mongoose from 'mongoose';
import {
  handleEditMessage,
  handleDeleteMessage,
  handleDraftMessage,
  handleMessaging,
} from './services';
import registerMessagesHandlers from './messages';

const joinRooms = async (socket: Socket, userId: mongoose.Types.ObjectId) => {
  const chatIds = await getChatIds(userId);
  chatIds.forEach((chatId: mongoose.Types.ObjectId) => {
    socket.join(chatId.toString());
  });
};

const socketSetup = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connection', async (socket) => {
    const { userId } = socket.handshake.query;
    console.log(`New client connected: ${socket.id}`);
    await joinRooms(socket, new mongoose.Types.ObjectId(userId as string));

    socket.on('SEND_MESSAGE', (data: any, ack: Function) =>
      handleMessaging(io, socket, data, ack)
    );

    socket.on('EDIT_MESSAGE_CLIENT', (data: any, ack: Function) =>
      handleEditMessage(socket, data, ack)
    );

    socket.on('DELETE_MESSAGE', (data: any, ack: Function) =>
      handleDeleteMessage(socket, data, ack)
    );

    socket.on('UPDATE_DRAFT', (data: any, ack: Function) =>
      handleDraftMessage(socket, data, ack)
    );

    registerChatHandlers(io, socket);
    registerMessagesHandlers(io, socket);
  });
};

export default socketSetup;
