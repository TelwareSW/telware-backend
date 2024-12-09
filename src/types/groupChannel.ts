import IChat from './chat';

interface IGroupChannel extends IChat {
  name: string;
  messagingPermission: boolean;
  downloadingPermission: boolean;
  privacy: boolean;
  createdAt: Date;
  isFilterd: boolean;
}

export default IGroupChannel;
