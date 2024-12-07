import mongoose from 'mongoose';

const communicationSchema = new mongoose.Schema(
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Communication = mongoose.model('Communication', communicationSchema);
export default Communication;
