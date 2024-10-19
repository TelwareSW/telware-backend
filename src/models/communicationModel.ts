import mongoose from 'mongoose';

const communicationSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    chat: {
      type: mongoose.Types.ObjectId,
      ref: 'Chat',
    },
    receivers: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        status: {
          type: String,
          enum: ['sent', 'delivered', 'read'],
          default: 'sent',
        },
      },
    ],
    sender: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
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
