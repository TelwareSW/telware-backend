import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import corsOptions from '@base/config/cors';
import registerChatHandlers from '@base/sockets/chat';
import { getChatIds } from '@services/chatService';
import mongoose from 'mongoose';
import {
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  handleForwardMessage,
  handleReplyMessage,
  handleDraftMessage,
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
    socket.on('SEND_MESSAGE', (data: any, func: Function) =>
      handleSendMessage(io, socket, data, func)
    );

    socket.on('EDIT_MESSAGE_CLIENT', (data: any, func: Function) =>
      handleEditMessage(socket, data, func)
    );

    socket.on('REPLY_MESSAGE', (data: any, func: Function) =>
      handleReplyMessage(socket, data, func)
    );

    socket.on('DELETE_MESSAGE', (data: any, func: Function) =>
      handleDeleteMessage(socket, data, func)
    );

    socket.on('FORWARD_MESSAGE', (data: any, func: Function) =>
      handleForwardMessage(socket, data, func)
    );
    socket.on('UPDATE_DRAFT', (data: any, func: Function) =>
      handleDraftMessage(socket, data, func)
    );

    registerChatHandlers(io, socket);
    registerMessagesHandlers(io, socket);
  });
};

export default socketSetup;
