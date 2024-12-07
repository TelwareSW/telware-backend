import ICommunication from './communication';

interface IVoiceCall extends ICommunication {
  timestamp: Date;
  duration: number;
  status: String;
}

export default IVoiceCall;
