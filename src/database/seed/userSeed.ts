import fs from 'fs';
import { faker } from '@faker-js/faker';
import User from '@models/userModel';
import Chat from '@models/chatModel';

const existingUsers = JSON.parse(
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

const fakerUsers = faker.helpers.multiple(createRandomUser, { count: 20 });

const createRandomChat = async (users: any[]) => {
  const members = faker.helpers.arrayElements(
    users,
    faker.number.int({ min: 2, max: 5 })
  );
  const chatType = faker.helpers.arrayElement(['private', 'group', 'channel']);

  const chat = {
    isSeen: true,
    destructionTimestamp: faker.datatype.boolean() ? new Date() : undefined,
    destructionDuration: faker.datatype.boolean()
      ? faker.number.int({ max: 24 })
      : undefined,
    members: members.map((user: any) => ({
      _id: user._id,
      Role: faker.helpers.arrayElement(['member', 'admin', 'creator']),
    })),
    type: chatType,
  };

  return Chat.create(chat);
};

const importData = async () => {
  try {
    const allUsers = [...existingUsers, ...fakerUsers];
    const createdUsers = await User.create(allUsers);

    const chatsToSeed = await Promise.all(
      Array.from({ length: 10 }).map(async () => {
        const chat = await createRandomChat(createdUsers);
        chat.members.forEach(async (userRef: any) => {
          await User.findByIdAndUpdate(userRef._id, {
            $push: { chats: chat._id },
          });
        });
        return chat;
      })
    );

    console.log(
      `Successfully seeded ${createdUsers.length} users and ${chatsToSeed.length} chats.`
    );
  } catch (err) {
    console.error('Failed to seed user and chat data:');
    console.error(err instanceof Error ? err.message : err);
  }
};

export default importData;
