import mongoose from 'mongoose';

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

async function mongoDBConnection(MONGO_URI: string) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfuly to MongoDB server !');
  } catch (err) {
    console.log('Failed to connect to database :(');
    console.log(err);
  }
}

export default mongoDBConnection;
