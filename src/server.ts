import app from '@base/app';
import mongoDBConnection from '@config/mongoDB';
import '@config/redis';

mongoDBConnection(process.env.MONGO_DB_URL as string);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
