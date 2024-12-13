import mongoose from 'mongoose';
import IChat from '@base/types/chat';

const chatSchema = new mongoose.Schema<IChat>(
  {
    isSeen: {
      type: Boolean,
      default: true,
    },
    members: [
      {
        user: { type: mongoose.Types.ObjectId, ref: 'User' },
        Role: {
          type: String,
          enum: ['member', 'admin'],
          default: 'member',
        },
      },
    ],
    type: {
      type: String,
      enum: ['private', 'group', 'channel'],
      default: 'private',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    discriminatorKey: 'chatType',
    collection: 'Chat',
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        delete ret.chatType;
        if (ret.members) {
          ret.members.forEach((member: any) => {
            delete member.id;
            delete member._id;
          });
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

chatSchema.virtual('numberOfMembers').get(function () {
  return Array.isArray(this.members) ? this.members.length : 0;
});

const Chat = mongoose.model<IChat>('Chat', chatSchema);
export default Chat;
