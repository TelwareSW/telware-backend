import Message from '@base/models/messageModel';
import mongoose from 'mongoose';
import { Server, Socket } from 'socket.io';

interface PinMessageData {
  chatId: string | mongoose.Types.ObjectId;
  messageId: string | mongoose.Types.ObjectId;
  userId: string | mongoose.Types.ObjectId;
}

async function handlePinMessage(socket: Socket, data: PinMessageData) {
  try {
    // Make a message pinned
    const message = await Message.findById(data.messageId);
    if (!message) {
      //TODO: Make a global socket event for the client to send errors to
      return;
    }

    message.isPinned = true;
    await message.save();

    // Send an event to all online chat users to pin a message.
    socket.to(data.chatId.toString()).emit('PIN_MESSAGE_SERVER', data);
  } catch (err) {
    //TODO: Make a global socket event for the client to send errors to
  }
}

async function registerMessagesHandlers(io: Server, socket: Socket) {
  socket.on('PIN_MESSAGE_CLIENT', (data: PinMessageData) =>
    handlePinMessage(socket, data)
  );
}

export default registerMessagesHandlers;
