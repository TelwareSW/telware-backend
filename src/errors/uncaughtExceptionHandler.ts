process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION!! Shutting Down....');
  console.error(err.name, err.message);
  process.exit(1);
});
