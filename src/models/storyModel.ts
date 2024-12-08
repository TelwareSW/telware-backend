import mongoose from 'mongoose';
import IStory from '@base/types/story';

const storySchema = new mongoose.Schema<IStory>(
  {
    content: {
      type: String,
      required: [true, 'story must have content'],
    },
    caption: {
      type: String,
      default: '',
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
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

const Story = mongoose.model<IStory>('Story', storySchema);
export default Story;
