import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import IUser from '@base/types/user';
import generateConfirmationCode from '@utils/generateConfirmationCode';
import crypto from 'crypto';

const userSchema = new mongoose.Schema<IUser>(
  {
    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    providerId: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      minlength: [5, 'Username is at least 5 characters'],
      maxlength: [100, 'Username is at most 15 characters'],
      validate: {
        validator(username: string): boolean {
          const regex = /^[A-Za-z0-9_]+$/;
          return regex.test(username);
        },
        message: 'Username can contain only letters, numbers and underscore',
      },
    },
    screenFirstName: {
      type: String,
      default: '',
    },
    screenLastName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      validate: [
        {
          validator(email: string): boolean {
            return validator.isEmail(email);
          },
          message: 'please provide a valid email',
        },
        {
          async validator(email: string): Promise<boolean> {
            if (this.provider === 'local') {
              const existingUser = await mongoose.models.User.find({
                email,
              });
              if (
                !existingUser ||
                existingUser.length === 0 ||
                (existingUser.length === 1 &&
                  existingUser[0]._id.equals(this._id))
              )
                return true;
              return false;
            }
            return true;
          },
          message: 'Email already exists',
        },
      ],
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      validate: [
        {
          validator(phoneNumber: string): boolean {
            return validator.isMobilePhone(phoneNumber);
          },
          message: 'please provide a valid phone number',
        },
        {
          async validator(phoneNumber: string): Promise<boolean> {
            if (this.provider === 'local') {
              const existingUser = await mongoose.models.User.find({
                phoneNumber,
              });
              if (
                !existingUser ||
                existingUser.length === 0 ||
                (existingUser.length === 1 &&
                  existingUser[0]._id.equals(this._id))
              )
                return true;
              return false;
            }
            return true;
          },
          message: 'Phone number already exists',
        },
      ],
    },
    password: {
      type: String,
      required: [true, 'A password is required'],
      maxLength: [15, 'max length is 15 characters'],
      minLength: [8, 'min length is 8 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'confirm your password'],
      select: false,
      validate: {
        validator(passwordConfirm: String): boolean {
          return passwordConfirm === this.password;
        },
        message: 'passwords are not the same',
      },
    },
    photo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['online', 'connected', 'offline'],
      default: 'offline',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxlength: [70, 'Bio is at most 70 characters'],
      default: '',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'unverified', 'deactivated', 'banned'],
      default: 'unverified',
    },
    maxFileSize: {
      type: Number,
      default: 3145,
    },
    automaticDownloadEnable: {
      type: Boolean,
      default: true,
    },
    lastSeenPrivacy: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone',
    },
    readReceiptsEnablePrivacy: {
      type: Boolean,
      default: true,
    },
    storiesPrivacy: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone',
    },
    picturePrivacy: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone',
    },
    invitePermessionsPrivacy: {
      type: String,
      enum: ['everyone', 'admins'],
      default: 'everyone',
    },
    stories: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Story',
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    contacts: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    chats: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Chat',
        isMuted: {
          type: Boolean,
          default: false,
        },
        unmuteDuration: Number,
        Draft: {
          type: String,
          default: '',
        },
        messages: [
          {
            sender: {
              type: mongoose.Types.ObjectId,
              ref: 'User', 
            },
            receiver: {
              type: mongoose.Types.ObjectId,
              ref: 'User',
            },
            content: {
              type: String,
              required: true,
            },
            timestamp: {
              type: Date,
              default: Date.now,
            },
            isRead: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
    changedPasswordAt: { type: Date, select: false },
    emailVerificationCode: { type: String, select: false },
    emailVerificationCodeExpires: { type: Number, select: false },
    verificationAttempts: { type: Number, select: false, default: 0 },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: String, select: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//TODO: Add index

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (this.provider === 'local') {
    this.providerId = this._id as string;
  }
  next();
});

userSchema.methods.isCorrectPassword = async function (
  candidatePass: string
): Promise<boolean> {
  const result = await bcrypt.compare(candidatePass, this.password);
  if (result) this.matchedPasswords = true;
  return result;
};

userSchema.methods.passwordChanged = function (tokenIssuedAt: number): boolean {
  if (
    this.changedPasswordAt &&
    this.changedPasswordAt.getTime() / 1000 > tokenIssuedAt
  )
    return true;
  return false;
};

//FIX: fix this function
userSchema.methods.selectFields = function (): void {
  this.select(
    '-__v -provider -providerId -password -isAdmin -stories -blockedUsers -contacts -chats -changedPasswordAt -emailVerificationCode -emailVerificationCodeExpires -resetPasswordToken -resetPasswordExpires'
  );
};

userSchema.methods.generateSaveConfirmationCode = function (): string {
  const confirmationCode: string = generateConfirmationCode();
  this.emailVerificationCode = crypto
    .createHash('sha256')
    .update(confirmationCode)
    .digest('hex');
  this.emailVerificationCodeExpires =
    Date.now() + Number(process.env.VERIFICATION_CODE_EXPIRES_IN) * 60 * 1000;
  return confirmationCode;
};

userSchema.methods.createResetPasswordToken = function (): string {
  const resetPasswordToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetPasswordToken)
    .digest('hex');

  this.resetPasswordExpires =
    Date.now() +
    parseInt(process.env.RESET_TOKEN_EXPIRES_IN as string, 10) * 60 * 1000;

  return resetPasswordToken;
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;