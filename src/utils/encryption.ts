import crypto from 'crypto';

export const encryptKey = (key: String, iv: String) => {
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(process.env.ENCRYPTION_KEY_SECRET as string, 'hex'),
    Buffer.from(iv, 'hex')
  );

  const encryptedKey = Buffer.concat([
    cipher.update(Buffer.from(key, 'hex')),
    cipher.final(),
  ]).toString('hex');
  return { encryptedKey, authTag: cipher.getAuthTag().toString('hex') };
};

export const decryptKey = (key: String, iv: String, authTag: String) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(process.env.ENCRYPTION_KEY_SECRET as string, 'hex'),
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  return Buffer.concat([
    decipher.update(Buffer.from(key, 'hex')),
    decipher.final(),
  ]).toString('hex');
};
