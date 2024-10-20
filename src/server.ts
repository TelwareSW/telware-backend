import mongoose from 'mongoose';
import app from './app';
import './config/redis';

mongoose
  .connect(process.env.MONGO_DB_URL as string)
  .then(() => {
    console.log('Connected successfuly to MongoDB server !');
  })
  .catch((err) => {
    console.log('Failed to connect to database :(');
    console.log(err);
  });

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
