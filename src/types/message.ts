import { Types } from 'mongoose';
import ICommunication from './communication';

interface IMessage extends ICommunication {
  toObject(): unknown;
  timestamp: Date;
  media: string;
  content: string;
  contentType: string;
  isPinned: boolean;
  isForward: boolean;
  isEdited: boolean;
  isAnnouncement: boolean;
  senderId: Types.ObjectId;
  chatId: Types.IGroupChannel;
  parentMessageId: Types.ObjectId | undefined;
  threadMessages: Types.ObjectId[];
  isAppropriate: boolean;
}

export default IMessage;
