import fs from 'fs';
import { faker } from '@faker-js/faker';
import User from '@models/userModel';
import Chat from '@models/chatModel';
import Message from '@models/messageModel';

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
    faker.number.int({ min: 2, max: 15 })
  );
  const chatType = faker.helpers.arrayElement(['private', 'group', 'channel']);
  if (chatType === 'private') members.length = 2;

  const chat = {
    members: members.map((user: any, index: Number) => ({
      _id: user._id,
      Role:
        index === 0
          ? 'creator'
          : faker.helpers.arrayElement(['member', 'admin', 'creator']),
    })),
    type: chatType,
  };

  return Chat.create(chat);
};

const createRandomMessage = async (users: any[], chat: any) => {
  const sender = faker.helpers.arrayElement(users);
  const message = {
    content: faker.lorem.sentence(),
    senderId: sender._id,
    chatId: chat._id,
  };

  return Message.create(message);
};

const importData = async () => {
  try {
    const allUsers = [...existingUsers, ...fakerUsers];
    const createdUsers = await User.create(allUsers);

    const chatsToSeed = await Promise.all(
      Array.from({ length: 10 }).map(async () => {
        const chat = await createRandomChat(createdUsers);
        await Promise.all(
          Array.from({ length: 10 }).map(() =>
            createRandomMessage(chat.members, chat)
          )
        );
        chat.members.forEach(async (userRef: any) => {
          await User.findByIdAndUpdate(userRef._id, {
            $push: { chats: chat._id },
          });
        });
        return chat;
      })
    );

    const firstTwoUsers = createdUsers
      .filter(
        (user: any) =>
          user.username === 'test_user1' || user.username === 'test_user2'
      )
      .map((user: any) => ({
        _id: user._id,
      }));
    const longChat = await Chat.create({
      members: firstTwoUsers,
      type: 'private',
    });
    await Promise.all(
      Array.from({ length: 100 }).map(() =>
        createRandomMessage(firstTwoUsers, longChat)
      )
    );

    longChat.members.forEach(async (userRef: any) => {
      await User.findByIdAndUpdate(userRef._id, {
        $push: { chats: longChat._id },
      });
    });

    console.log(
      `Successfully seeded ${createdUsers.length} users and ${chatsToSeed.length + 1} chats.`
    );
  } catch (err) {
    console.error('Failed to seed user and chat data:');
    console.error(err instanceof Error ? err.message : err);
  }
};

export default importData;
