import server from '@base/server';

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION!! Shutting Down....');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
