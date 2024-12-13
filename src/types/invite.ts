import { ObjectId } from 'mongoose';

interface invite {
  token: string;
  expiresIn: Date;
  chatId: ObjectId;
}

export default invite;
