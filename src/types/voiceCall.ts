import { Types } from 'mongoose';
import ICommunication from './communication';

interface IVoiceCall extends ICommunication {
  callType: String;
  currentParticipants: Types.ObjectId[];
  duration: Number;
  status: String;
}

export default IVoiceCall;
