import IVoiceCall from '@base/types/voiceCall';
import mongoose from 'mongoose';
import Communication from './communicationModel';

const voiceCallSchema = new mongoose.Schema<IVoiceCall>(
  {
    duration: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['declined', 'answered'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const VoiceCall = Communication.discriminator('VoiceCall', voiceCallSchema);
export default VoiceCall;
