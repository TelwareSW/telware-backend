import IMessage from '@base/types/message';
import mongoose from 'mongoose';

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
      default: 'text',
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
    timestamp: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    discriminatorKey: 'messageType',
    collection: 'Message',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
