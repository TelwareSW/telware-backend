import { Document, Types } from 'mongoose';

interface IUser extends Document {
  provider: string;
  providerId: string | undefined;
  username: string;
  screenName: string;
  email: string;
  phoneNumber: string | undefined;
  password: string | undefined;
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
  stories: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
  contacts: Types.ObjectId[];
  chats: Types.ObjectId[];
  changedPasswordAt: Date | undefined;
  emailVerificationCode: string | undefined;
  emailVerificationCodeExpires: number | undefined;
  resetPasswordToken: string | undefined;
  resetPasswordExpires: number | undefined;
  generateSaveConfirmationCode: () => string;
  // eslint-disable-next-line no-unused-vars
  isCorrectPassword: (candidatePass: string) => Promise<boolean>;
  createResetPasswordToken: () => string;
}

export default IUser;
