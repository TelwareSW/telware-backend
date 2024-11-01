import { Document, Types } from 'mongoose';

interface ICommunication extends Document {
  timestamp: Date;
  chat: Types.ObjectId;
  receivers: Types.ObjectId;
  sender: Types.ObjectId;
}

export default ICommunication;
