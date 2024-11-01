import { Types } from 'mongoose';
import IMessage from './message';

interface INormalMessage extends IMessage {
  isAnnouncement: boolean;
  parentMessage: Types.ObjectId | undefined;
}

export default INormalMessage;
