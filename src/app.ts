import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

import AppError from '@errors/AppError';
import globalErrorHandler from '@errors/globalErrorHandler';
import apiRouter from '@routes/apiRoute';
import path from 'path';
import corsOptions from '@config/cors';
import sessionMiddleware from '@config/session';

const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Telware Backend API',
      description: 'API Documentation for Telware Backend',
      version: '1.0.0',
      contact: {
        email: 'telware.sw@gmail.com',
      },
      license: {
        name: 'Apache 2.0',
        url: 'http://apache.org/',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1/',
        description: 'Local server',
      },
      {
        url: 'ws://localhost:3000',
        description: 'WebSocket server',
      },
    ],
  },
  apis: [`${__dirname}/swagger/docs/*.ts`],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use('/static', express.static(path.join(process.cwd(), 'src/public')));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from the same IP! Please try again later in an hour',
});
if (process.env.NODE_ENV === 'production') {
  app.use('/api', limiter);
}

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
