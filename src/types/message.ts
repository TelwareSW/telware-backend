import { Types } from 'mongoose';
import ICommunication from './communication';

interface IMessage extends ICommunication {
  media: string;
  content: string;
  contentType: string;
  isPinned: boolean;
  isForward: boolean;
  isEdited: boolean;
  isAnnouncement: boolean;
  deliveredTo: Types.ObjectId[];
  readBy: Types.ObjectId[];
  senderId: Types.ObjectId;
  chatId: Types.ObjectId;
  parentMessageId: Types.ObjectId | undefined;
  threadMessages: Types.ObjectId[];
  isAppropriate: boolean;
}

export default IMessage;
