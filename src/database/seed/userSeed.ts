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
    username: faker.internet.userName().replace(/[.\-/\\]/g, ''),
    phoneNumber: faker.phone.number({style:"international"}),
    password,
    passwordConfirm: password,
  };
};

const fakerUsers = faker.helpers.multiple(createRandomUser, {
  count: 20,
});

const importUserData = async () => {
  try {
    const allUsers = [...users, ...fakerUsers];

    console.log('Users to be seeded:', JSON.stringify(allUsers, null, 2));

    allUsers.forEach(user => {
      if (user.password !== user.passwordConfirm) {
        throw new Error(`Password and password confirm do not match for user ${  user.username}`);
      }
    });

    await User.create(allUsers);

    console.log('Users data seeded successfully!');
  } catch (err) {
    console.error('Failed to seed users data :(');
    console.error(err);
  }
};

export default importUserData;
