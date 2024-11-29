import { Types } from 'mongoose';
import IMessage from './message';

interface INormalMessage extends IMessage {
  isAnnouncement: boolean; // Use primitive type
  parentMessage: Types.ObjectId | undefined;
}

export default INormalMessage;
