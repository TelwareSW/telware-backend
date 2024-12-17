import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import corsOptions from '@base/config/cors';
import registerChatHandlers from '@base/sockets/chats';
import redisClient from '@base/config/redis';
import { Types } from 'mongoose';
import { joinAllRooms } from './MessagingServices';
import registerMessagesHandlers from './messages';
import { authorizeSocket, protectSocket } from './middlewares';
import registerVoiceCallHandlers from './voiceCalls';

const socketSetup = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.use(authorizeSocket);
  io.use(protectSocket);

  io.on('connection', async (socket: any) => {
    const userId = socket.request.session.user.id;
    console.log(`New client with userID ${userId} connected: ${socket.id}`);
    await joinAllRooms(socket, new Types.ObjectId(userId as string));

    socket.on('error', (error: Error) => {
      console.error(`Socket error on ${socket.id}:`, error);

      socket.emit('ERROR', {
        message: 'An error occurred on the server',
        details: error.message,
      });
    });

    socket.on('disconnect', async () => {
      console.log(`Client with userID ${userId} disconnected: ${socket.id}`);
      socket.request.session.user.lastSeenTime = Date.now();
      socket.request.session.user.status = 'offline';
      socket.request.session.save();
      await redisClient.sRem(`user:${userId}:sockets`, socket.id);
    });

    registerChatHandlers(io, socket, userId);
    registerMessagesHandlers(io, socket, userId);
    registerVoiceCallHandlers(io, socket, userId);
  });
};

export default socketSetup;
