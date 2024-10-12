import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import dotenv from 'dotenv';

import AppError from '@errors/AppError';
import globalErrorHandler from '@errors/globalErrorHandler';

dotenv.config();
const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set some HTTP response headers to increase security
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from the same IP! Please try again later in an hour',
});
app.use('/api', limiter);

// Parse request as json
app.use(express.json({ limit: '10kb' }));

// NoSQL injection attack
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp(/* { whitelist: [...] } */));

// TODO: Protect against cross-site scripting attack

// Not Found Route
app.all('*', (req, res, next) => {
  next(new AppError(`${req.originalUrl} - Not Found!`, 404));
});

app.use(globalErrorHandler);

export default app;
