import express from 'express';
import Joi from 'joi';
import * as auditController from '../controllers/audit.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { permission } from '../middleware/permission.middleware.js';

const router = express.Router();

const querySchema = Joi.object({
  entity: Joi.string().optional(),
  entityId: Joi.string().optional(),
  userId: Joi.string().optional(),
  action: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
  sort: Joi.string().optional()
});

router.get('/', auth, permission('audit'), validate(querySchema, 'query'), auditController.getAuditLogs);

export default router;
