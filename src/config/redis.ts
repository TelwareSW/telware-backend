import { createClient } from 'redis';

const REDIS_URL = 'redis://redis:6379';

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient
  .connect()
  .then(() => console.log('Connected successfuly to redis server !'))
  .catch((err) => console.log(err));

export default redisClient;
