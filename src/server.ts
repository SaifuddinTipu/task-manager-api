import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './sockets/task.socket';
import { env } from './config/env';

const httpServer = http.createServer(app);
initSocket(httpServer);

connectDB().then(() => {
  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
});
