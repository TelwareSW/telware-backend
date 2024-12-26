import IVoiceCall from '@base/types/voiceCall';
import mongoose from 'mongoose';
import Communication from './communicationModel';

const voiceCallSchema = new mongoose.Schema<IVoiceCall>({
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number, default: -1 },
  callType: { type: String, enum: ['group', 'private'], required: true },
  status: { type: String, enum: ['ongoing', 'finished'], default: 'ongoing' },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  currentParticipants: [
    { type: mongoose.Types.ObjectId, ref: 'User', default: [] },
  ],
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
});

const VoiceCall = Communication.discriminator('VoiceCall', voiceCallSchema);
export default VoiceCall;
