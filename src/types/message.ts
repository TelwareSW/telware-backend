import { Document } from 'mongoose';

interface IMessage extends Document {
  timestamp: Date;
  content: string;
  contentType: string;
  isPinned: boolean;
  isForward: boolean;
  isAnnouncement: boolean;
}

export default IMessage;
