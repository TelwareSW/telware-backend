import mongoose from 'mongoose';
import Message from '@models/messageModel';

const normalMessageSchema = new mongoose.Schema(
  {
    isAnnouncement: {
      type: Boolean,
      default: false,
    },
    parentMessage: {
      type: mongoose.Types.ObjectId,
      ref: 'NormalMessage',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const NormalMessage = Message.discriminator(
  'NormalMessage',
  normalMessageSchema
);
export default NormalMessage;
