import Chat from '@base/models/chatModel';
import VoiceCall from '@base/models/voiceCallModel';
import mongoose from 'mongoose';

export default async function createVoiceCall(chatId: string, userId: string) {
  const chat = await Chat.findById(chatId);

  const voiceCall = new VoiceCall({
    callType: chat?.type === 'private' ? 'private' : 'group',
    senderId: new mongoose.Types.ObjectId(userId),
    chatId: new mongoose.Types.ObjectId(chatId),
  });

  await voiceCall.save();

  return voiceCall;
}
