import mongoose, { mongo } from 'mongoose';
import IStory from '@base/types/story';
import { type } from 'os';

const storySchema = new mongoose.Schema<IStory>(
  {
    content: {
      type: String,
      required: [true, 'story must have content'],
    },
    caption: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    views: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Story = mongoose.model<IStory>('Story', storySchema);
export default Story;
