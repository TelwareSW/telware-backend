import { Types } from 'mongoose';
import IMessage from './message';

interface IChannelMessage extends IMessage {
  threadMessages: Types.ObjectId;
}

export default IChannelMessage;
