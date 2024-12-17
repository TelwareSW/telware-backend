import IChat from './chat';

interface INormalChat extends IChat {
  encryptionKey: String;
  initializationVector: String;
  authTag: String;
  destructionTimestamp: Date | undefined;
  destructionDuration: number | undefined;
}

export default INormalChat;
