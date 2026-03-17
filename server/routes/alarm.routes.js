import express from 'express';
import Joi from 'joi';
import * as alarmController from '../controllers/alarm.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { permission } from '../middleware/permission.middleware.js';
import { ALARM_SEVERITY, ALARM_STATUS } from '../utils/constants.js';

const router = express.Router();

const createAlarmSchema = Joi.object({
  siteId: Joi.string().required(),
  alarmType: Joi.string().required(),
  severity: Joi.string().valid(...Object.values(ALARM_SEVERITY)).required(),
  description: Joi.string().required(),
  slaThreshold: Joi.number().integer().min(1).optional(),
  rootCauseTags: Joi.array().items(Joi.string()).optional()
});

const updateAlarmSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ALARM_STATUS)).optional(),
  rootCause: Joi.string().allow('').optional(),
  rootCauseTags: Joi.array().items(Joi.string()).optional(),
  resolution: Joi.string().allow('').optional(),
  notes: Joi.string().allow('').optional(),
  slaThreshold: Joi.number().integer().min(1).optional()
});

const assignSchema = Joi.object({
  engineerId: Joi.string().required()
});

const simulateSchema = Joi.object({
  count: Joi.number().integer().min(1).max(50).default(5)
});

router.post('/', auth, permission('alarms'), validate(createAlarmSchema), alarmController.createAlarm);
router.get('/', auth, permission('alarms'), alarmController.getAllAlarms);
router.get('/stats', auth, permission('alarms'), alarmController.getAlarmStats);
router.post('/simulate', auth, permission('alarms'), validate(simulateSchema), alarmController.simulateAlarms);
router.get('/:id', auth, permission('alarms'), alarmController.getAlarmById);
router.put('/:id', auth, permission('alarms'), validate(updateAlarmSchema), alarmController.updateAlarm);
router.patch('/:id/assign', auth, permission('alarms'), validate(assignSchema), alarmController.assignEngineer);
router.delete('/:id', auth, permission('alarms'), alarmController.deleteAlarm);

export default router;
