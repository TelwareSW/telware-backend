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
    username: faker.internet.userName().replace(/[.\-/\\]/g, ''),
    phoneNumber: faker.phone.number({ style: 'international' }),
    password,
    passwordConfirm: password,
  };
};

const fakerUsers = faker.helpers.multiple(createRandomUser, { count: 20 });
<<<<<<< HEAD

const createRandomChat = async (users: any[]) => {
  const members = faker.helpers.arrayElements(users, faker.number.int({ min: 2, max: 5 }));
  const chatType = faker.helpers.arrayElement(['private', 'group', 'channel']);

  const chat = {
    isSeen: true,
    destructionTimestamp: faker.datatype.boolean() ? new Date() : undefined,
    destructionDuration: faker.datatype.boolean() ? faker.number.int({ max: 24 }) : undefined,
    members: members.map((user: any) => ({
      _id: user._id,
      Role: faker.helpers.arrayElement(['member', 'admin', 'creator']),
    })),
    type: chatType,
  };

  return Chat.create(chat);
};
=======
>>>>>>> a71252dc6be692b05edd570b5a4161dc10dc1c3f

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
<<<<<<< HEAD
          await User.findByIdAndUpdate(userRef._id, { $push: { chats: chat._id } });
=======
          await User.findByIdAndUpdate(userRef._id, {
            $push: { chats: chat._id },
          });
>>>>>>> a71252dc6be692b05edd570b5a4161dc10dc1c3f
        });
        return chat;
      })
    );

<<<<<<< HEAD
    console.log(`Successfully seeded ${createdUsers.length} users and ${chatsToSeed.length} chats.`);
=======
    console.log(
      `Successfully seeded ${createdUsers.length} users and ${chatsToSeed.length} chats.`
    );
>>>>>>> a71252dc6be692b05edd570b5a4161dc10dc1c3f
  } catch (err) {
    console.error('Failed to seed user and chat data:');
    console.error(err instanceof Error ? err.message : err);
  }
};

export default importData;
