import fs from 'fs';
import { faker } from '@faker-js/faker';
import User from '@models/userModel';

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/json/users.json`, 'utf-8')
);

const createRandomUser = () => ({
  email: faker.internet.email(),
  username: faker.internet.userName(),
  phoneNumber: faker.phone.number(),
  password: faker.internet.password(),
});

const fakerUsers = faker.helpers.multiple(createRandomUser, {
  count: 20,
});

const importUserData = async () => {
  try {
    // TODO: make this create complete users
    await User.create({ ...users, ...fakerUsers });

    console.log('Users data is seeded successfully!');
  } catch (err) {
    console.log('Failed to seed users data :(');
    console.log(err);
  }
};

export default importUserData;
