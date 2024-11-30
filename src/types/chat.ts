import { Types, Document } from 'mongoose';

interface IChat extends Document {
  isSeen: boolean;
  members: Types.ObjectId[];
  type: string;
}

export default IChat;
