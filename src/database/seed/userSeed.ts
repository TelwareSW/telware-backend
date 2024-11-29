import fs from 'fs';
import { faker } from '@faker-js/faker';
import User from '@models/userModel';
import mongoose from 'mongoose';

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/json/users.json`, 'utf-8')
);

const createRandomMessage = (sender: mongoose.Types.ObjectId, receiver: mongoose.Types.ObjectId) => ({
  sender,
  receiver,
  content: faker.lorem.sentence(),
  timestamp: faker.date.recent(),
  isRead: faker.datatype.boolean(),
});

const createRandomChat = () => {
  const user1 = new mongoose.Types.ObjectId();
  const user2 = new mongoose.Types.ObjectId();

  const messages = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () =>
    createRandomMessage(user1, user2)
  );

  return {
    _id: new mongoose.Types.ObjectId(),
    isMuted: faker.datatype.boolean(),
    unmuteDuration: faker.number.int({ min: 0, max: 60 }),
    Draft: faker.lorem.sentence(),
    messages,
  };
};

const createRandomUser = () => {
  const password = faker.internet.password({ length: 12, memorable: true });

  const chats = Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, createRandomChat);
  return {
    email: faker.internet.email(),
    username: faker.internet
      .userName()
      .replace(/[.\-/\\]/g, '')
      .padEnd(2, '_')
      .padStart(2, '_')
      .substring(0, 15),
    phoneNumber: faker.phone.number({ style: 'international' }),
    password,
    passwordConfirm: password,
    accountStatus: 'active',
    chats,
  };
};

// Generate a list of random users
const fakerUsers = faker.helpers.multiple(createRandomUser, { count: 20 });

// Import the data into the database
const importUserData = async () => {
  try {
    const allUsers = [...users, ...fakerUsers];
    await User.create(allUsers);
    console.log('Users data seeded successfully!');
  } catch (err) {
    console.error('Failed to seed users data :(');
    console.error(err);
  }
};

export default importUserData;
