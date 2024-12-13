import IChat from './chat';

interface INormalChat extends IChat {
  destructionTimestamp: Date | undefined;
  destructionDuration: number | undefined;
}

export default INormalChat;
