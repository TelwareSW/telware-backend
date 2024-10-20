import app from './app';
import client from './config/redis';

// TODO: Database Configurations

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
