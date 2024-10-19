import ICommunication from './communication';

interface IVoiceCall extends ICommunication {
  timestamp: Date;
  Duration: number;
  status: String;
}

export default IVoiceCall;
