import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { ObjectId } from 'mongoose';
import redisClient from '@config/redis';
import UAParser from 'ua-parser-js';

export const getSocketsByUserId = (userId: ObjectId): string[] => ['socketIds'];

export const generateSession = (req: any) => {
  const sessionId = req.header('X-Session-Token') as string;
  return sessionId || randomUUID();
};

export const getSession = (req: Request, sessionId: string) =>
  new Promise((resolve, reject) => {
    req.sessionStore.get(sessionId, (err, session) => {
      if (err) return reject(err);
      if (!session)
        redisClient.sRem(`user:${req.session.user?.id}:sessions`, sessionId);
      resolve(session);
    });
  });

export const reloadSession = (req: Request) =>
  new Promise((resolve, _reject) => {
    req.session.reload((_error) => {
      resolve(undefined);
    });
  });

export const destroySession = (
  req: Request,
  res: Response,
  sessionId?: string
) =>
  new Promise((resolve, reject) => {
    if (!sessionId)
      req.session.destroy((error: Error) => {
        if (error) return reject(error);
        res.clearCookie('connect.sid');
        resolve(undefined);
      });
    else {
      req.sessionStore.destroy(sessionId, (error: Error) => {
        if (error) return reject(error);
        res.clearCookie('connect.sid');
        resolve(undefined);
      });
    }
  });

export const regenerateSession = async (req: Request) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      resolve(undefined);
    });
  });

export const saveSession = async (id: ObjectId, req: Request) => {
  await regenerateSession(req);
  const parser = new UAParser();
  parser.setUA(req.header('user-agent') as string);
  const browser = parser.getBrowser();
  req.session.user = {
    id,
    timestamp: Date.now(),
    lastSeenTime: Date.now(),
    status: 'online',
    agent: {
      device: parser.getDevice().vendor,
      os: parser.getOS().name,
      browser: browser.name
        ? `${browser.name} ${browser.version || ''}`
        : undefined,
    },
  };
  await redisClient.sAdd(`user:${id}:sessions`, req.sessionID);
};

export const getAllSessionsByUserId = async (userId: ObjectId) =>
  redisClient.sMembers(`user:${userId}:sessions`);

export const destroyAllSessionsByUserId = async (
  req: Request,
  res: Response
) => {
  const sessionIds = (
    await getAllSessionsByUserId(req.session.user?.id as ObjectId)
  ).filter((sessionId) => sessionId !== req.sessionID);

  const promises = sessionIds.map((sessionId) =>
    destroySession(req, res, sessionId)
  );

  await Promise.all(promises);
  await redisClient.del(`user:${req.session.user?.id}:sessions`);
};
