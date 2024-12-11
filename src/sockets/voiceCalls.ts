import { Server, Socket } from 'socket.io';

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
  console.log('Inside Create Call');
}

async function handleJoinCall(
  io: Server,
  socket: Socket,
  data: JoinLeaveCallData,
  userId: string
) {
  console.log('Inside Join Call');
}

async function handleSignal(
  io: Server,
  socket: Socket,
  data: SignalData,
  userId: string
) {
  console.log('Inside Signal');
}

async function handleLeaveCall(
  io: Server,
  socket: Socket,
  data: JoinLeaveCallData,
  userId: string
) {
  console.log('Inside Leave Call');
}

async function registerVoiceCallHandlers(
  io: Server,
  socket: Socket,
  userId: string
) {
  socket.on('CREATE-CALL', (data: CreateCallData) => {
    handleCreateCall(io, socket, data, userId);
  });

  socket.on('JOIN-CALL', (data: JoinLeaveCallData) => {
    handleJoinCall(io, socket, data, userId);
  });

  socket.on('SIGNAL', (data: SignalData) => {
    handleSignal(io, socket, data, userId);
  });

  socket.on('LEAVE', (data: JoinLeaveCallData) => {
    handleLeaveCall(io, socket, data, userId);
  });
}

export default registerVoiceCallHandlers;
