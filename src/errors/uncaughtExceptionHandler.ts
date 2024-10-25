process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION!!');
  console.error(err.name, err.message);
});
