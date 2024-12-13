import { Types, Document } from 'mongoose';

interface IChat extends Document {
  isSeen: boolean;
  members: { user: Types.ObjectId; Role: string }[];
  type: string;
  isDeleted: boolean;
}

export default IChat;
