import mongoose from 'mongoose';

const DB_DOCKER_URI: string | undefined =
  process.env.MONGO_DB_DOCKER_URL?.replace(
    '{USER}',
    process.env.MONGO_DB_USER as string
  ).replace('{PASSWORD}', process.env.MONGO_DB_PASSWORD as string);

const DB_URI =
  process.env.ENV === 'localhost'
    ? (process.env.MONGO_DB_LOCALHOST_URL as string)
    : (DB_DOCKER_URI as string);

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

async function mongoDBConnection() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected successfuly to MongoDB server !');
  } catch (err) {
    console.log('Failed to connect to database :(');
    console.log(err);
  }
}

export default mongoDBConnection;
