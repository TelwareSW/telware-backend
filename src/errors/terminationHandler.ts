import mongoose from 'mongoose';

const cleanup = async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  console.log('Bye Bye :(');
  process.exit(0);
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
