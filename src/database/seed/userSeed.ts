import fs from 'fs';
import { faker } from '@faker-js/faker';
import User from '@models/userModel';

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/json/users.json`, 'utf-8')
);

const createRandomUser = () => {
  const password = faker.internet.password({ length: 12, memorable: true });

  return {
    email: faker.internet.email(),
    username: faker.internet
      .username()
      .replace(/[.\-/\\]/g, '')
      .padEnd(2, '_')
      .padStart(2, '_')
      .substring(0, 15),
    phoneNumber: faker.phone.number({ style: 'international' }),
    password,
    passwordConfirm: password,
    accountStatus: 'active',
  };
};

const fakerUsers = faker.helpers.multiple(createRandomUser, {
  count: 20,
});

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
