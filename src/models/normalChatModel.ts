import mongoose from 'mongoose';
import crypto from 'crypto';
import { encryptKey } from '@utils/encryption';
import INormalChat from '@base/types/normalChat';
import Chat from './chatModel';

const normalChatSchema = new mongoose.Schema<INormalChat>({
  encryptionKey: {
    type: String,
    default: crypto.randomBytes(32).toString('hex'),
  },
  initializationVector: {
    type: String,
    default: crypto.randomBytes(12).toString('hex'),
  },
  authTag: {
    type: String,
    default: '',
  },
  destructionTimestamp: Date,
  destructionDuration: Number,
});

normalChatSchema.pre('save', function (next) {
  if (!this.isNew) return next();
  const { encryptedKey, authTag } = encryptKey(
    this.encryptionKey,
    this.initializationVector
  );
  this.encryptionKey = encryptedKey;
  this.authTag = authTag;
  next();
});

const NormalChat = Chat.discriminator('NormalChat', normalChatSchema);
export default NormalChat;
