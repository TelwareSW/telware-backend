import mongoose from 'mongoose';
import Message from '@models/messageModel';
import IChannelMessage from '@base/types/channelMessage';

const channelMessageSchema = new mongoose.Schema<IChannelMessage>(
  {
    threadMessages: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'NormalMessage',
        default: [],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const ChannelMessage = Message.discriminator(
  'ChannelMessage',
  channelMessageSchema
);
export default ChannelMessage;

//TODO:
//
