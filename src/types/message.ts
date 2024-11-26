import { Document, Types } from 'mongoose';

interface IMessage extends Document {
  timestamp: Date;
  content: string;
  contentType: string;
  isPinned: boolean;
  isForward: boolean;
  isAnnouncement: boolean;
  senderId: Types.ObjectId;
  chatId: Types.ObjectId;
}

export default IMessage;
