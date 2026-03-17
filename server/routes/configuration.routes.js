import express from 'express';
import Joi from 'joi';
import * as configurationController from '../controllers/configuration.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { permission } from '../middleware/permission.middleware.js';

const router = express.Router();

const configCreateSchema = Joi.object({
  siteId: Joi.string().required(),
  parameters: Joi.object({
    ipAddress: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required(),
    vlan: Joi.string().required(),
    frequency: Joi.string().required(),
    pci: Joi.string().required(),
    softwareVersion: Joi.string().required()
  }).required(),
  changeReason: Joi.string().allow('').optional()
});

const rollbackSchema = Joi.object({
  targetVersion: Joi.number().integer().min(1).required()
});

router.post('/', auth, permission('configuration'), validate(configCreateSchema), configurationController.createConfiguration);
router.get('/:siteId/latest', auth, permission('configuration'), configurationController.getLatestConfiguration);
router.get('/:siteId/history', auth, permission('configuration'), configurationController.getConfigurationHistory);
router.get('/:siteId/compare', auth, permission('configuration'), configurationController.compareVersions);
router.post('/:siteId/rollback', auth, permission('configuration'), validate(rollbackSchema), configurationController.rollbackConfiguration);

export default router;
