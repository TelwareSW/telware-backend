process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION!!');
  console.error(err.name, err.message);
});
