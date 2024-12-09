import mongoose from 'mongoose';
import IGroupChannel from '@base/types/groupChannel';
import Chat from './chatModel';

const groupChannelSchema = new mongoose.Schema<IGroupChannel>({
  name: {
    type: String,
    required: [true, 'chat must have a name'],
  },
  messagingPermission: {
    type: Boolean,
    default: true,
  },
  downloadingPermission: {
    type: Boolean,
    default: true,
  },
  privacy: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isFilterd: {
    type: Boolean,
    default: false,
  },
});

const GroupChannel = Chat.discriminator('GroupChannel', groupChannelSchema);
export default GroupChannel;
