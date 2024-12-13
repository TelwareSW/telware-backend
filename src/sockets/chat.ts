import { Server, Socket } from 'socket.io';
import { updateDraft } from './services';

export const handleDraftMessage = async (
  io: Server,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: string
) => {
  const { chatId, content } = data;
  await updateDraft(io, senderId, chatId, content);
  ack({ success: true, message: 'Draft saved' });
};

const registerChatHandlers = (io: Server, socket: Socket, userId: any) => {
  socket.on('UPDATE_DRAFT_CLIENT', (data: any, ack: Function) =>
    handleDraftMessage(io, socket, data, ack, userId)
  );
};

export default registerChatHandlers;
