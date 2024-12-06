import { Types, Document } from 'mongoose';

interface IChat extends Document {
  isSeen: boolean;
  members: Types.ObjectId[];
  type: string;
  isDeleted: boolean;
}

export default IChat;
