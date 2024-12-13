import { Server, Socket } from 'socket.io';
import {
  addClientToCall,
  createVoiceCall,
  getClientSocketId,
  removeClientFromCall,
} from './voiceCallsServices';

interface CreateCallData {
  chatId: string;
  targetId: string | undefined;
}

interface JoinLeaveCallData {
  voiceCallId: string;
}

interface SignalData {
  type: 'ICE' | 'OFFER' | 'ANSWER';
  targetId: string;
  voiceCallId: string;
  data: any;
}

async function handleCreateCall(
  io: Server,
  socket: Socket,
  data: CreateCallData,
  userId: string
) {
  const { targetId } = data;
  let { chatId } = data;

  if (targetId && !chatId) {
    //TODO: Create a new chat between the target and the user.
    chatId = '123';
  }

  const voiceCall = await createVoiceCall(chatId, userId);

  io.to(chatId).emit('CALL-STARTED', {
    snederId: userId,
    chatId,
    voiceCallId: voiceCall._id,
  });
}

async function handleJoinCall(
  io: Server,
  socket: Socket,
  data: JoinLeaveCallData,
  userId: string
) {
  const { voiceCallId } = data;

  await addClientToCall(socket, userId, voiceCallId);

  socket.join(voiceCallId);

  socket.to(voiceCallId).emit('CLIENT-JOINED', {
    clientId: userId,
    voiceCallId,
  });
}

async function handleSignal(
  io: Server,
  socket: Socket,
  signalData: SignalData,
  userId: string
) {
  const { type, targetId, voiceCallId, data } = signalData;

  const socketId = getClientSocketId(voiceCallId, targetId);

  io.to(socketId).emit('SIGNAL-CLIENT', {
    type,
    senderId: userId,
    voiceCallId,
    data,
  });
}

async function handleLeaveCall(
  io: Server,
  socket: Socket,
  data: JoinLeaveCallData,
  userId: string
) {
  const { voiceCallId } = data;

  socket.leave(voiceCallId);

  await removeClientFromCall(userId, voiceCallId);

  socket.to(voiceCallId).emit('CLIENT-LEFT', {
    clientId: userId,
    voiceCallId,
  });
}

async function registerVoiceCallHandlers(
  io: Server,
  socket: Socket,
  userId: string
) {
  socket.on('CREATE-CALL', (data: CreateCallData) => {
    handleCreateCall(io, socket, data, userId.toString());
  });

  socket.on('JOIN-CALL', (data: JoinLeaveCallData) => {
    handleJoinCall(io, socket, data, userId.toString());
  });

  socket.on('SIGNAL-SERVER', (data: SignalData) => {
    handleSignal(io, socket, data, userId.toString());
  });

  socket.on('LEAVE', (data: JoinLeaveCallData) => {
    handleLeaveCall(io, socket, data, userId.toString());
  });

  //TODO: DON'T FORGET TO HANDLE ERRORS (WRAP HANDLERS WITH ANOTHER FUNCTION LIKE catchAsync)
}

export default registerVoiceCallHandlers;
