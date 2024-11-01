import mongoose from 'mongoose';
import Message from '@models/messageModel';
import IChannelMessage from '@base/types/channelMessage';

const channelMessageSchema = new mongoose.Schema<IChannelMessage>(
  {
    threadMessages: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'NormalMessage',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const NormalMessage = Message.discriminator(
  'ChannelMessage',
  channelMessageSchema
);
export default NormalMessage;

//TODO:
//
