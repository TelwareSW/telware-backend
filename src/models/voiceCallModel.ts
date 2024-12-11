import IVoiceCall from '@base/types/voiceCall';
import mongoose from 'mongoose';
import Communication from './communicationModel';

const voiceCallSchema = new mongoose.Schema<IVoiceCall>({
  timestamp: { type: Date, required: true },
  duration: { type: Number },
  callType: { type: String, enum: ['group', 'private'], required: true },
  status: { type: String, enum: ['ongoing', 'finished'], required: true },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  currentParticipants: [
    { type: mongoose.Types.ObjectId, ref: 'User', required: true, default: [] },
  ],
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
});

const VoiceCall = Communication.discriminator('VoiceCall', voiceCallSchema);
export default VoiceCall;
