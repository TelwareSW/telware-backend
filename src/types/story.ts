import { Document, Types } from 'mongoose';

interface IStory extends Document {
  content: string;
  caption: string;
  timestamp: Date;
  duration: number;
  views: Types.ObjectId;
}

export default IStory;
