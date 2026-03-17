import { createServer } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import config from './config/env.js';
import { initializeSocket } from './sockets/alarm.socket.js';
import { startAlarmEscalationJob } from './jobs/alarm-escalation.job.js';
import cacheService from './services/cache.service.js';
import logger from './utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.CLIENT_URL,
    credentials: true
  }
});

app.set('io', io);
initializeSocket(io);

let escalationTimer;

async function start() {
  try {
    await connectDB();
    await cacheService.connect();

    escalationTimer = startAlarmEscalationJob(io, config.ALARM_ESCALATION_INTERVAL_MS);

    httpServer.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err?.message || err);
    process.exit(1);
  }
}

start();

process.on('SIGINT', () => {
  if (escalationTimer) clearInterval(escalationTimer);
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  httpServer.close(() => process.exit(1));
});
