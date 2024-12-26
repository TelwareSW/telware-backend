import crypto from 'crypto';

export const encryptKey = (key: String) => {
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(process.env.ENCRYPTION_KEY_SECRET as string, 'hex'),
    Buffer.from(process.env.ENCRYPTION_KEY_IV as string, 'hex')
  );

  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(key, 'hex')),
    cipher.final(),
  ]).toString('hex');
  return { encrypted, authTag: cipher.getAuthTag().toString('hex') };
};

export const decryptKey = (key: String, authTag: String) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(process.env.ENCRYPTION_KEY_SECRET as string, 'hex'),
    Buffer.from(process.env.ENCRYPTION_KEY_IV as string, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  return Buffer.concat([
    decipher.update(Buffer.from(key, 'hex')),
    decipher.final(),
  ]).toString('hex');
};

export const encryptMessage = (message: String, key: String, iv: String) => {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );

  return Buffer.concat([
    cipher.update(Buffer.from(message)),
    cipher.final(),
  ]).toString('hex');
};
