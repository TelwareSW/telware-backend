import mongoose from 'mongoose';
import INormalChat from '@base/types/normalChat';
import Chat from './chatModel';

const normalChatSchema = new mongoose.Schema<INormalChat>(
  {},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const NormalChat = Chat.discriminator('NormalChat', normalChatSchema);
export default NormalChat;
