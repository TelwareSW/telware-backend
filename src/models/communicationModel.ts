import ICommunication from '@base/types/communication';
import mongoose from 'mongoose';

const communicationSchema = new mongoose.Schema<ICommunication>(
  {
    timestamp: {
      type: Date,
      default: Date.now,
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
    discriminatorKey: 'communicationType',
    collection: 'Communication',
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        delete ret.communicationType;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

communicationSchema.index({ timestamp: -1 }, { unique: true, background: true });

const Communication = mongoose.model('Communication', communicationSchema);
export default Communication;
