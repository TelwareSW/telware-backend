import mongoose from 'mongoose';
import dotenv from 'dotenv';
import mongoDBConnection from '@config/mongoDB';
import importUserData from './userSeed';

dotenv.config();

const importData = async () => {
  try {
    console.log('🌱 Seeding Database...');
    await mongoDBConnection(process.env.MONGO_DB_LOCALHOST_URL as string);
    const users = importUserData();
    await Promise.all([users]);
    console.log('Done seeding database successfully!');
  } catch (err) {
    console.log(`Failed to seed database :(`);
    console.log(err);
  } finally {
    console.log(`Close Server...`);
    await mongoose.connection.close();
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await mongoDBConnection(process.env.MONGO_DB_LOCALHOST_URL as string);
    if (mongoose.connection.db === undefined) throw new Error();
    await mongoose.connection.db.dropDatabase();
    console.log(`Done deleting database successfully!`);
  } catch (err) {
    console.log(`Failed to delete database :(`);
    console.log(err);
  } finally {
    console.log(`Close Server...`);
    await mongoose.connection.close();
    process.exit();
  }
};

if (!['--import', '--delete'].includes(process.argv[2])) {
  console.log('You should pass --import or --delete as an argument');
  process.exit();
}

if (process.argv[2] === '--import') {
  importData();
} else {
  deleteData();
}
