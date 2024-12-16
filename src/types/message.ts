import { Types } from 'mongoose';
import ICommunication from './communication';

interface IMessage extends ICommunication {
  timestamp: Date;
  media: string;
  content: string;
  contentType: string;
  isPinned: boolean;
  isForward: boolean;
  isEdited: boolean;
  isAnnouncement: boolean;
  senderId: Types.ObjectId;
  chatId: Types.ObjectId;
  parentMessageId: Types.ObjectId | undefined;
  threadMessages: Types.ObjectId[];
}

export default IMessage;
