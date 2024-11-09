import { readFileSync } from 'fs';

const allowedOrigins = JSON.parse(
  readFileSync(`${__dirname}/config/allowedOrigins.json`, 'utf8')
);

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  withCredentials: true,
  exposedHeaders: ['set-cookie'],
};

export default corsOptions;
