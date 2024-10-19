import { Document, Types } from 'mongoose';
import IStory from './story';

interface IUser extends Document {
  username: string;
  screenName: string;
  email: string;
  password: string;
  passwordConfirm: string | undefined;
  photo: string | undefined;
  status: string;
  isAdmin: boolean;
  bio: string;
  accountStatus: string;
  maxFileSize: number;
  automaticDownloadEnable: boolean;
  lastSeenPrivacy: String;
  readReceiptsEnablePrivacy: String;
  storiesPrivacy: String;
  picturePrivacy: String;
  invitePermessionsPrivacy: String;
  stories: IStory[];
  blockedUsers: Types.ObjectId[];
  chats: Types.ObjectId[];
}

export default IUser;
