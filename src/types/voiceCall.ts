import ICommunication from './communication';

interface IVoiceCall extends ICommunication {
  duration: number;
  status: String;
}

export default IVoiceCall;
