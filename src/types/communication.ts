import { Document, Types } from 'mongoose';

interface ICommunication extends Document {
  timestamp: Date;
  senderId: Types.ObjectId;
  chatId: Types.ObjectId;
}

export default ICommunication;
