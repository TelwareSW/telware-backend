import mongoose from 'mongoose';
import dotenv from 'dotenv';
import importData from './userSeed';

dotenv.config();
// eslint-disable-next-line import/first, import/order
import mongoDBConnection from '@config/mongoDB';

const seed = async () => {
  try {
    console.log('🌱 Seeding Database....');
    await importData();
    console.log('Done seeding database successfully!');
  } catch (err) {
    console.log(`Failed to seed database :(`);
    console.log(err);
  }
};

const start = async (wouldImport: boolean = false) => {
  try {
    console.log('⚠️  Dropping Database....');
    await mongoDBConnection();
    if (mongoose.connection.db === undefined) throw new Error();
    await mongoose.connection.db.dropDatabase();
    console.log(`Done dropping database successfully!`);
    if (wouldImport) await seed();
  } catch (err) {
    console.log(`Failed to drop database :(`);
    console.log(err);
  } finally {
    mongoose.disconnect();
    process.exit();
  }
};

if (!['--import', '--delete'].includes(process.argv[2])) {
  console.log('You should pass --import or --delete as an argument');
  process.exit();
}

start(process.argv[2] === '--import');
