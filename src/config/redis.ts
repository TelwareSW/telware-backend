import { createClient } from 'redis';

const REDIS_URI =
  process.env.ENV === 'localhost'
    ? process.env.REDIS_LOCALHOST_URL
    : process.env.REDIS_DOCKER_URL;

const redisClient = createClient({
  url: REDIS_URI,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient
  .connect()
  .then(() => console.log('Connected successfuly to redis server !'))
  .catch((err) => console.log(err));

export default redisClient;
