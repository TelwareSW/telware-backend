import '@config/env'
import '@config/passport';
import mongoDBConnection from '@config/mongoDB';
import app from '@base/app';

mongoDBConnection();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
