import IChat from './chat';

interface IGroupChannel extends IChat {
  name: string;
  messagnigPermession: boolean;
  downloadingPermession: boolean;
  privacy: boolean;
  createdAt: Date;
  isFilterd: boolean;
}

export default IGroupChannel;
