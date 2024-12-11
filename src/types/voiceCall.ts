import { Types } from 'mongoose';
import ICommunication from './communication';

interface IVoiceCall extends ICommunication {
  callType: String;
  participants: Types.ObjectId[];
  duration: Number;
}

export default IVoiceCall;
