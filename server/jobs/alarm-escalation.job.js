import alarmService from '../services/alarm.service.js';
import logger from '../utils/logger.js';

export const startAlarmEscalationJob = (io, intervalMs) => {
  logger.info(`Alarm escalation job started with interval ${intervalMs}ms`);

  const timer = setInterval(async () => {
    try {
      await alarmService.runAgingAndEscalation(io);
    } catch (error) {
      logger.error('Alarm escalation job failed:', error.message);
    }
  }, intervalMs);

  return timer;
};
