import { ObjectId } from 'mongoose';
import session from 'express-session';
import RedisStore from 'connect-redis';

import { generateSession } from '@services/sessionService';
import redisClient from '@config/redis';

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface SessionData {
    user: {
      id: ObjectId;
      timestamp: number;
      lastSeenTime: number;
      status: 'online' | 'offline';
      agent?: {
        device?: string;
        os?: string;
        browser?: string;
      };
    };
  }
}

const maxAge =
  parseInt(process.env.SESSION_EXPIRES_IN as string, 10) * 24 * 60 * 60 * 1000;

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient, ttl: maxAge / 1000 }),
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  genid: generateSession,
  cookie: {
    maxAge,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
});

export default sessionMiddleware;
