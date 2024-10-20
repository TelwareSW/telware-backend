import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import dotenv from 'dotenv';

import AppError from '@errors/AppError';
import globalErrorHandler from '@errors/globalErrorHandler';
import apiRouter from '@routes/apiRoute';

dotenv.config();
const app = express();

const allowedOrigins = ['*'];
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

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
