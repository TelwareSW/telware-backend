import mongoose from 'mongoose';
import IStory from '@base/types/story';

export default new mongoose.Schema<IStory>(
  {
    content: {
      type: String,
      required: [true, 'story must have content'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
      default: 24 * 60 * 60,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
