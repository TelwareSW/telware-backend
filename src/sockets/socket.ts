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
} from './services';

const joinRooms = async (socket: Socket, userId: mongoose.Types.ObjectId) => {
  const chatIds = await getChatIds(userId, 'all');
  chatIds.forEach((chatId: mongoose.Types.ObjectId) => {
    socket.join(chatId.toString());
  });
};

const socketSetup = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: corsOptions,
  });
  let counter = 0;
  io.on('connection', async (socket) => {
    console.log(`New client connected: ${socket.id}`);

    let userId = new mongoose.Types.ObjectId('67471ac6fd7d7888434613e4');
    if (counter === 0)
      userId = new mongoose.Types.ObjectId('67471ac6fd7d7888434613e4'); //TODO: Replace it with the actual userId
    else if (counter === 1)
      userId = new mongoose.Types.ObjectId('67471ac6fd7d7888434613e5'); //TODO: Replace it with the actual userId
    else userId = new mongoose.Types.ObjectId('67471ac6fd7d7888434613e6');
    counter += 1;
    await joinRooms(socket, userId);

    socket.on('SEND_MESSAGE', (data: any, func: Function) =>
      handleSendMessage(socket, data, func)
    );
    socket.on('EDIT_MESSAGE', (data: any, func: Function) =>
      handleEditMessage(data, func)
    );
    socket.on('REPLY_MESSAGE', (data: any, func: Function) =>
      handleReplyMessage(socket, data, func)
    );
    socket.on('DELETE_MESSAGE', (data: any, func: Function) =>
      handleDeleteMessage(data, func)
    );
    socket.on('FORWARD_MESSAGE', (data: any, func: Function) =>
      handleForwardMessage(socket, data, func)
    );
    registerChatHandlers(io, socket);
  });
};

export default socketSetup;
