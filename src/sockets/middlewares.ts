import redisClient from '@base/config/redis';
import sessionMiddleware from '@base/config/session';
import AppError from '@base/errors/AppError';
import { reloadSession } from '@base/services/sessionService';
import { Socket } from 'socket.io';

export const protectSocket = async (socket: any, next: any) => {
  try {
    await reloadSession(socket.request);
    if (!socket.request.session.user) {
      return next(
        new AppError('Session not found, you are not allowed here!', 401)
      );
    }
    await redisClient.sAdd(
      `user:${socket.request.session.user.id}:sockets`,
      socket.id
    );
    socket.request.session.user.lastSeenTime = Date.now();
    socket.request.session.user.status = 'online';
    socket.request.session.save();
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const authorizeSocket = (socket: Socket, next: any) => {
  const sessionToken = socket.handshake.auth.sessionId;
  const req = socket.request;

  req.headers['x-session-token'] = sessionToken;
  sessionMiddleware(req as any, {} as any, next);
};
