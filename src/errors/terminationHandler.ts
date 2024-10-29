import mongoose from 'mongoose';
import redisClient from '@config/redis';

const cleanup = async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  await redisClient.quit();
  console.log('Bye Bye :(');
  process.exit(0);
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
