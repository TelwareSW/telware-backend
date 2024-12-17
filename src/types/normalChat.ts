import IChat from './chat';

interface INormalChat extends IChat {
  encryptionKey: String;
  initializationVector: String;
  keyAuthTag: String;
  vectorAuthTag: String;
  destructionTimestamp: Date | undefined;
  destructionDuration: number | undefined;
}

export default INormalChat;
