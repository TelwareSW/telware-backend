import { Document, Types } from 'mongoose';
import IStory from './story';

interface IUser extends Document {
  username: string;
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
  lastSeenPrivacy: string;
  readReceiptsEnablePrivacy: boolean;
  storiesPrivacy: string;
  picturePrivacy: string;
  invitePermessionsPrivacy: string;
  stories: IStory[];
  blockedUsers: Types.ObjectId[];
  chats: Types.ObjectId[];
  refreshToken: string;
  emailVerificationCode: string | undefined;
  emailVerificationCodeExpires: number | undefined;
  generateSaveConfirmationCode: () => string;
  // eslint-disable-next-line no-unused-vars
  isCorrectPassword: (candidatePass: string) => Promise<boolean>;
}

export default IUser;
