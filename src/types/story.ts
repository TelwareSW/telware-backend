import { Document } from 'mongoose';

interface IStory extends Document {
  content: string;
  timestamp: Date;
  duration: number;
}

export default IStory;
