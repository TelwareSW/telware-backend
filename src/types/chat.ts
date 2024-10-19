import { Types, Document } from 'mongoose';

interface IChat extends Document {
  isSeen: boolean;
  destructionTimestamp: Date | undefined;
  destructionDuration: number | undefined;
  members: Types.ObjectId[];
}

export default IChat;
