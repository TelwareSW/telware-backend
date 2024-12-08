import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import corsOptions from '@base/config/cors';
import registerChatHandlers from '@base/sockets/chat';
import { getChatIds } from '@services/chatService';
import redisClient from '@base/config/redis';
import mongoose from 'mongoose';
import {
  handleEditMessage,
  handleDeleteMessage,
  handleDraftMessage,
  handleMessaging,
  handleAddAdmins,
  handleCreateGroupChannel,
  handleDeleteGroupChannel,
  handleLeaveGroupChannel,
  handleAddMembers,
} from './services';
import registerMessagesHandlers from './messages';
import { authorizeSocket, protectSocket } from './middlewares';

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

  io.use(authorizeSocket);
  io.use(protectSocket);

  io.on('connection', async (socket: any) => {
    const userId = socket.request.session.user.id;
    console.log(`New client with userID ${userId} connected: ${socket.id}`);
    await joinRooms(socket, new mongoose.Types.ObjectId(userId as string));

    socket.on('SEND_MESSAGE', (data: any, ack: Function) =>
      handleMessaging(io, socket, data, ack, userId)
    );

    socket.on('EDIT_MESSAGE_CLIENT', (data: any, ack: Function) =>
      handleEditMessage(socket, data, ack)
    );

    socket.on('DELETE_MESSAGE', (data: any, ack: Function) =>
      handleDeleteMessage(socket, data, ack)
    );

    socket.on('UPDATE_DRAFT', (data: any, ack: Function) =>
      handleDraftMessage(socket, data, ack, userId)
    );

    socket.on('ADD_ADMINS_CLIENT', (data: any, ack: Function) => {
      handleAddAdmins(io, data, ack, userId);
    });

    socket.on('ADD_MEMBERS_CLIENT', (data: any, ack: Function) => {
      handleAddMembers(io, data, ack, userId);
    });

    socket.on('CREATE_GROUP_CHANNEL', (data: any, ack: Function) => {
      handleCreateGroupChannel(io, socket, data, ack, userId);
    });

    socket.on('DELETE_GROUP_CHANNEL_CLIENT', (data: any, ack: Function) => {
      handleDeleteGroupChannel(io, socket, data, ack, userId);
    });

    socket.on('LEAVE_GROUP_CHANNEL_CLIENT', (data: any, ack: Function) => {
      handleLeaveGroupChannel(io, socket, data, ack, userId);
    });

    socket.on('CREATE_GROUP_CHANNEL', (data: any, ack: Function) => {
      createGroupChannel(io, socket, data, ack, userId);
    });

    socket.on('DELETE_GROUP_CHANNEL_CLIENT', (data: any, ack: Function) => {
      deleteGroupChannel(io, socket, data, ack, userId);
    });

    socket.on('LEAVE_GROUP_CHANNEL_CLIENT', (data: any, ack: Function) => {
      leaveGroupChannel(io, socket, data, ack, userId);
    });

    socket.on('disconnect', async () => {
      console.log(`Client with userID ${userId} disconnected: ${socket.id}`);
      socket.request.session.user.lastSeenTime = Date.now();
      socket.request.session.user.status = 'offline';
      socket.request.session.save();
      await redisClient.sRem(`user:${userId}:sockets`, socket.id);
    });

    registerChatHandlers(io, socket);
    registerMessagesHandlers(io, socket);
  });
};

export default socketSetup;
