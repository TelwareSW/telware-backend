import { Types } from 'mongoose';
import ICommunication from './communication';

interface IMessage extends ICommunication {
  content: string;
  media: string;
  mediaName: string;
  mediaSize: number;
  contentType: string;
  isPinned: boolean;
  isForward: boolean;
  isEdited: boolean;
  isAnnouncement: boolean;
  deliveredTo: Types.ObjectId[];
  readBy: Types.ObjectId[];
  parentMessageId: Types.ObjectId | undefined;
  threadMessages: Types.ObjectId[];
  isAppropriate: boolean;
}

export default IMessage;
