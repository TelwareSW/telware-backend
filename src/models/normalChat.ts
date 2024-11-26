import mongoose from 'mongoose';
import Chat from './chatModel';

const normalChatSchema = new mongoose.Schema(
  {},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const NormalChat = Chat.discriminator('NormalChat', normalChatSchema);
export default NormalChat;
