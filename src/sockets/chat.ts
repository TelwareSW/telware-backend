import { Server, Socket } from 'socket.io';

const registerChatHandlers = (io: Server, socket: Socket) => {
  socket.on('message', (message) => {
    console.log(`Message: ${message}`);
  });
};

export default registerChatHandlers;
