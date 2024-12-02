import { Document, Types } from 'mongoose';

interface IMessage extends Document {
  timestamp: Date;
  media: string;
  content: string;
  contentType: string;
  isPinned: boolean;
  isForward: boolean;
  isAnnouncement: boolean;
  senderId: Types.ObjectId;
  chatId: Types.ObjectId;
  parentMessage: Types.ObjectId | undefined;
  threadMessages: Types.ObjectId[];
  messageType: string;
}

export default IMessage;
