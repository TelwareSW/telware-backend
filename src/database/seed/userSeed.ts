import fs from 'fs';
import { faker } from '@faker-js/faker';
import User from '@models/userModel';
import Message from '@models/messageModel';
import GroupChannel from '@base/models/groupChannelModel';
import NormalChat from '@base/models/normalChatModel';

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
    screenFirstName: faker.person.firstName(),
    screenLastName: faker.person.lastName(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    password,
    passwordConfirm: password,
    accountStatus: 'active',
  };
};

const fakerUsers: any = faker.helpers.multiple(createRandomUser, { count: 10 });

const createRandomMessage = async (chat: any) => {
  const sender: any = faker.helpers.arrayElement(chat.members);
  const patterns = [
    `Hey, ${faker.person.firstName()}! How's it going?`,
    `Just finished ${faker.word.verb()}ing, feeling great!`,
    `Do you know any good places for ${faker.food.dish()} around here?`,
    `I'm so ${faker.word.adjective()} about the ${faker.lorem.words(2)} tomorrow!`,
    `You should really try ${faker.food.dish()}. It's amazing!`,
    `Are you free this weekend for ${faker.word.verb()}ing?`,
    `Sounds great! Let me know what time works for you.`,
    `Wait, what does '${faker.word.noun()}' mean again?`,
    `I was just thinking about ${faker.lorem.sentence()}.`,
    `That's exactly what I was going to say!`,
    `Sorry, I totally forgot about ${faker.lorem.words(2)}. My bad!`,
    `Wow, your ${faker.commerce.product()} looks amazing today!`,
    `What time works best for you on ${faker.date.weekday()}?`,
    `I can't believe ${faker.lorem.sentence()} happened today!`,
    `Did you know that ${faker.lorem.sentence()}?`,
    `Why don’t we try ${faker.word.verb()}ing next weekend?`,
    `Why did the ${faker.animal.type()} cross the road? To get to the other side!`,
    `How’s your work on ${faker.company.name()} coming along?`,
    `Let’s meet at ${faker.date.weekday()} at ${faker.location.city()}, sounds good?`,
    `Thanks so much for the ${faker.commerce.productName()}, it really made my day!`,
  ];
  const content = faker.helpers.arrayElement(patterns);
  const message = {
    content,
    senderId: sender._id,
    chatId: chat._id,
  };

  return Message.create(message);
};

const generateGroupName = () => {
  const adjective = faker.word.adjective();
  const noun = faker.word.noun();
  return `${adjective} ${noun}`;
};

const createPublicChat = async (
  users: any[],
  takeAll?: boolean,
  cType?: String
) => {
  let members;
  let chatType;

  if (takeAll) {
    members = users;
    chatType = cType;
  } else {
    members = faker.helpers.arrayElements(
      users,
      faker.number.int({ min: 1, max: users.length })
    );
    chatType = faker.helpers.arrayElement(['group', 'channel']);
  }

  const chat = await GroupChannel.create({
    members: members.map((user: any, index: Number) => ({
      user: user.user,
      Role:
        index === 0
          ? 'creator'
          : faker.helpers.arrayElement(['member', 'admin']),
    })),
    name: generateGroupName(),
    type: chatType,
  });

  await Promise.all(
    users.map((user: any) =>
      User.findByIdAndUpdate(user.user, {
        $push: { chats: { chat: chat._id } },
      })
    )
  );

  await Promise.all(
    Array.from({ length: 100 }).map(() => createRandomMessage(chat))
  );
};

const createPrivateChat = async (users: any[]) => {
  const chat = await NormalChat.create({
    members: users,
  });

  await Promise.all(
    users.map((user: any) =>
      User.findByIdAndUpdate(user.user, {
        $push: { chats: { chat: chat._id } },
      })
    )
  );

  await Promise.all(
    Array.from({ length: 100 }).map(() => createRandomMessage(chat))
  );
};

const importData = async () => {
  try {
    const knownUsers = ((await User.create(existingUsers)) as any).map(
      (user: any) => ({
        user: user._id,
      })
    );

    const randomUsers = ((await User.create(fakerUsers)) as any).map(
      (user: any) => ({
        user: user._id,
      })
    );

    // Create private chats between every pair of known users
    await Promise.all(
      knownUsers.map(async (user: any, index: number) => {
        for (let i = index + 1; i < knownUsers.length; i += 1) {
          createPrivateChat([user, knownUsers[i]]);
        }
      })
    );

    // Create Groups and Channels between known users
    await Promise.all([
      Array.from({ length: 5 }).map(() => createPublicChat(knownUsers)),
      createPublicChat(knownUsers, true, 'channel'),
      createPublicChat(knownUsers, true, 'group'),
    ]);

    // Create random chats between random users
    await Promise.all([
      [
        Array.from({ length: 5 }).map(() =>
          createPublicChat([...knownUsers, ...randomUsers])
        ),
        createPublicChat([...knownUsers, ...randomUsers], true, 'channel'),
        createPublicChat([...knownUsers, ...randomUsers], true, 'group'),
      ],
    ]);
  } catch (err) {
    console.error('Failed to seed user and chat data:');
    console.error(err instanceof Error ? err.message : err);
  }
};

export default importData;
