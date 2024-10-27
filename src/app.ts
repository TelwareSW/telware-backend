import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import RedisStore from 'connect-redis';

import AppError from '@errors/AppError';
import globalErrorHandler from '@errors/globalErrorHandler';
import apiRouter from '@routes/apiRoute';
import path from 'path';
import redisClient from '@config/redis';
import { createSessionFromHeaders } from '@middlewares/authMiddleware';

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user?: any;
  }
}

const app = express();

const allowedOrigins = ['*'];
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

app.use('/static', express.static(path.join(process.cwd(), 'src/public')));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: parseInt(process.env.ACCESS_EXPIRES_IN as string, 10) * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  })
);
app.use(createSessionFromHeaders);

app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from the same IP! Please try again later in an hour',
});
app.use('/api', limiter);

// Set some HTTP response headers to increase security
app.use(helmet());

// NoSQL injection attack
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp(/* { whitelist: [...] } */));

// TODO: Protect against cross-site scripting attack

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1', apiRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`${req.originalUrl} - Not Found!`, 404));
});

app.use(globalErrorHandler);

export default app;
