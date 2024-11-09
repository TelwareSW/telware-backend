import http from 'http';
import '@config/env';
import '@config/passport';
import mongoDBConnection from '@config/mongoDB';
import app from '@base/app';
import socketSetup from './sockets/socket';

mongoDBConnection();

const httpServer = http.createServer(app);

socketSetup(httpServer);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const server = httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
