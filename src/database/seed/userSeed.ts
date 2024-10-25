import fs from 'fs';
import { faker } from '@faker-js/faker';
import User from '@models/userModel';

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/json/users.json`, 'utf-8')
);

// Function to create a random user
const createRandomUser = () => {
  const password = faker.internet.password({ length: 12, memorable: true });

  return {
    email: faker.internet.email(),
    username: faker.internet.userName().replace(/[.\-/\\]/g, ''),
    phoneNumber: faker.phone.number({style:"international"}),
    password, // Use the generated password
    passwordConfirm: password, // Ensure the password confirm matches the password
  };
};

// Generate random users
const fakerUsers = faker.helpers.multiple(createRandomUser, {
  count: 20,
});

const importUserData = async () => {
  try {
    // Combine existing users and randomly generated users
    const allUsers = [...users, ...fakerUsers];

    // Log the users data to debug
    console.log('Users to be seeded:', JSON.stringify(allUsers, null, 2));

    // Validate passwords match
    allUsers.forEach(user => {
      if (user.password !== user.passwordConfirm) {
        throw new Error(`Password and password confirm do not match for user ${  user.username}`);
      }
    });

    // Create users in the database
    await User.create(allUsers);

    console.log('Users data seeded successfully!');
  } catch (err) {
    console.error('Failed to seed users data :(');
    console.error(err);
  }
};

export default importUserData;
