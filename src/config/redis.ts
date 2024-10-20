import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient
  .connect()
  .then(() => console.log('Connected successfuly to redis server !'))
  .catch((err) => console.log(err));

export default redisClient;
