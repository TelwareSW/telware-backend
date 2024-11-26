import IMessage from '@base/types/message';
import mongoose from 'mongoose';
import Communication from './communicationModel';

const messageSchema = new mongoose.Schema<IMessage>(
  {
    content: {
      type: String,
      required: [true, 'a message must have content'],
    },
    contentType: {
      type: String,
      enum: [
        'text',
        'image',
        'GIF',
        'sticker',
        'audio',
        'video',
        'file',
        'link',
      ],
      required: [true, 'message must have a content type'],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isForward: {
      type: Boolean,
      default: false,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'message must have senderId'],
      ref: 'User',
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'message must have chatId'],
      ref: 'Chat',
    },
  },
  {
    discriminatorKey: 'messageType',
    collection: 'Message',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Message = Communication.discriminator('Message', messageSchema);
export default Message;
