import Chat from '@base/models/chatModel';
import VoiceCall from '@base/models/voiceCallModel';
import IVoiceCall from '@base/types/voiceCall';
import mongoose from 'mongoose';
import { Socket } from 'socket.io';

interface ClientSocketMap {
  [voiceCallId: string]: {
    [userId: string]: string;
  };
}

const clientSocketMap: ClientSocketMap = {};

async function endVoiceCall(voiceCallId: string) {
  // Delete voice call entry in map.
  delete clientSocketMap[voiceCallId];

  const voiceCall: IVoiceCall = await VoiceCall.findById(voiceCallId);

  // Calculate duration in minutes
  voiceCall.duration = Math.floor(
    (Date.now() - voiceCall.timestamp.getTime()) / (1000 * 60)
  );

  voiceCall.status = 'finished';

  await voiceCall.save();
}

export async function createVoiceCall(chatId: string, userId: string) {
  const chat = await Chat.findById(chatId);

  const voiceCall = new VoiceCall({
    callType: chat?.type === 'private' ? 'private' : 'group',
    senderId: new mongoose.Types.ObjectId(userId),
    chatId: new mongoose.Types.ObjectId(chatId),
  });

  await voiceCall.save();

  return voiceCall;
}

export async function addClientToCall(
  socket: Socket,
  userId: string,
  voiceCallId: string
) {
  // Add a user Id object into the call current participants.
  const voiceCall: IVoiceCall = await VoiceCall.findById(voiceCallId);
  const userIdObj = new mongoose.Types.ObjectId(userId);

  //TODO: UNCOMMENT AFTER IMPLEMENTING ERROR HANDLING
  /*
  if (voiceCall.status === 'finished') {
    throw new Error('This voice call has already finished!');
  }
  */

  const userIdIndex = voiceCall.currentParticipants.indexOf(userIdObj);

  if (userIdIndex === -1) {
    voiceCall.currentParticipants.push(userIdObj);
  } else {
    voiceCall.currentParticipants[userIdIndex] = userIdObj;
  }

  await voiceCall.save();

  // Add the client socket id into the map
  if (!clientSocketMap[voiceCallId]) clientSocketMap[voiceCallId] = {};
  clientSocketMap[voiceCallId][userId] = socket.id;
}

export async function removeClientFromCall(
  userId: string,
  voiceCallId: string
) {
  // Delete the userId entry from the map
  if (clientSocketMap[voiceCallId]) delete clientSocketMap[voiceCallId][userId];

  // Delete the userId from current participants of voice call.
  const voiceCall: IVoiceCall = await VoiceCall.findById(voiceCallId);
  const userIdObj = new mongoose.Types.ObjectId(userId);

  const userIdIndex = voiceCall.currentParticipants.indexOf(userIdObj);

  if (userIdIndex !== -1) {
    voiceCall.currentParticipants.splice(userIdIndex, 1);
    await voiceCall.save();
  }

  if (voiceCall.currentParticipants.length === 0) {
    await endVoiceCall(voiceCallId);
  }
}

export function getClientSocketMap(): ClientSocketMap {
  return clientSocketMap;
}

export function getClientSocketId(voiceCallId: string, userId: string) {
  //TODO: UNCOMMENT AFTER IMPLEMENTING ERROR HANDLING
  /*
  if (!clientSocketMap[voiceCallId])
    throw new Error('No voice call exists with this id!');

  if (!clientSocketMap[voiceCallId][userId])
    throw new Error('No socket exists for this user id!');
  */
  return clientSocketMap[voiceCallId][userId];
}
