import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.utils';

let io: Server;

export function initSocket(httpServer: any) {
  io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL } });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.data.userId);
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket not initialized');
  return io;
}
