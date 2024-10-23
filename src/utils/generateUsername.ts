import User from '@base/models/userModel';

const generateUniqueUsername = async (): Promise<string> => {
  let username: string;

  while (true) {
    username = btoa(Math.random().toString(36).substring(2, 17));
    username = username.replace(/[^a-zA-Z0-9]/g, '');
    console.log(username);
    // eslint-disable-next-line no-await-in-loop
    const user = await User.findOne({ username });
    if (!user) return username;
  }
};

export default generateUniqueUsername;
