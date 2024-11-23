import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import corsOptions from '@base/config/cors';
import registerChatHandlers from '@base/sockets/chat';

const socketSetup = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    registerChatHandlers(io, socket);
  });
};

export default socketSetup;
