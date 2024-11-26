import mongoose from 'mongoose';
import IChat from '@base/types/chat';

const chatSchema = new mongoose.Schema<IChat>(
  {
    isSeen: {
      type: Boolean,
      required: true,
      default: true,
    },
    destructionTimestamp: Date,
    destructionDuration: Number,
    members: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        Role: {
          type: String,
          enum: ['member', 'admin', 'creator'],
        },
      },
    ],
    type: {
      type: String,
      enum: ['private', 'group', 'channel'],
      default: 'private',
    },
  },
  {
    discriminatorKey: 'chatType',
    collection: 'Chat',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

chatSchema.virtual('numberOfMembers').get(function () {
  return this.members.length;
});

//TODO: create a virtual property => m4 fakra esmha but it's related to "seen"

//TODO: unreadMessages virtual property

const Chat = mongoose.model<IChat>('Chat', chatSchema);
export default Chat;
