import mongoose from 'mongoose';

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
