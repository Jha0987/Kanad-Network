import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import logger from '../utils/logger.js';

export const initializeSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, config.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.userId}`);

    socket.on('join:alarms', () => {
      socket.join('alarms');
    });

    socket.on('leave:alarms', () => {
      socket.leave('alarms');
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.userId}`);
    });
  });

  return io;
};
