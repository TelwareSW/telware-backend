import { Document, Types } from 'mongoose';

interface IMessage extends Document {
  timestamp: Date;
  content: String;
  contentType: String;
  isPinned: Boolean;
  isForward: Boolean;
  isAnnouncement: Boolean;
  senderId: Types.ObjectId;
  chatId: Types.ObjectId;
}

export default IMessage;
