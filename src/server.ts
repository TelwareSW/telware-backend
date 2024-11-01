import '@config/env'
import '@config/passport';
import mongoDBConnection from '@config/mongoDB';
import app from '@base/app';

const DB_DOCKER_URI: string | undefined =
  process.env.MONGO_DB_DOCKER_URL?.replace(
    '{USER}',
    process.env.MONGO_DB_USER as string
  ).replace('{PASSWORD}', process.env.MONGO_DB_PASSWORD as string);

const DB_URI =
  process.env.ENV === 'localhost'
    ? (process.env.MONGO_DB_LOCALHOST_URL as string)
    : (DB_DOCKER_URI as string);

mongoDBConnection(DB_URI);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
