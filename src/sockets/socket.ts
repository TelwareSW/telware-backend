import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

const socketSetup = (server: HTTPServer) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
  });
};

export default socketSetup;
