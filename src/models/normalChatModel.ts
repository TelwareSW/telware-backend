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
    default: crypto.randomBytes(16).toString('hex'),
  },
  keyAuthTag: {
    type: String,
    default: '',
  },
  vectorAuthTag: {
    type: String,
    default: '',
  },
  destructionTimestamp: Date,
  destructionDuration: Number,
});

normalChatSchema.pre('save', function (next) {
  if (!this.isNew) return next();
  const { encrypted: encryptedKey, authTag: keyAuthTag } = encryptKey(
    this.encryptionKey
  );
  const { encrypted: encryptedVector, authTag: vectorAuthTag } = encryptKey(
    this.initializationVector
  );
  this.encryptionKey = encryptedKey;
  this.keyAuthTag = keyAuthTag;
  this.initializationVector = encryptedVector;
  this.vectorAuthTag = vectorAuthTag;
  next();
});

const NormalChat = Chat.discriminator('NormalChat', normalChatSchema);
export default NormalChat;
