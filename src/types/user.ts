import { Document, Types } from 'mongoose';
import IStory from './story';

interface IUser extends Document {
  username: string;
  phoneNumber: string;
  screenName: string;
  email: string;
  phoneNumber: string;
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
  refreshToken: string;
  emailVerificationCode: string | undefined;
  emailVerificationCodeExpires: number | undefined;
  generateSaveConfirmationCode: () => string;
}

export default IUser;
