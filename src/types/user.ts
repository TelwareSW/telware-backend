import { Document, Types } from 'mongoose';

interface IUser extends Document {
  provider: string;
  providerId: string;
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
  verificationAttempts: number | undefined;
  resetPasswordToken: string | undefined;
  resetPasswordExpires: number | undefined;

  generateSaveConfirmationCode: () => string;
  isCorrectPassword: (_candidatePass: string) => Promise<boolean>;
  passwordChanged: (_tokenIssuedAt: number) => boolean;
  createResetPasswordToken: () => string;
  selectFields: () => void;
}

export default IUser;
