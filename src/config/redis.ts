import { createClient } from 'redis';

const redisWrapper = () => {
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });
  return async () => {
    try {
      redisClient.on('error', (err) => console.log('Redis Client Error', err));
      await redisClient.connect();
      console.log('Connected successfuly to redis server !');
    } catch (err) {
      console.log(err);
    }
  };
};

export default redisWrapper();
