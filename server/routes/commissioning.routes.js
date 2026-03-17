import express from 'express';
import Joi from 'joi';
import * as commissioningController from '../controllers/commissioning.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { permission } from '../middleware/permission.middleware.js';

const router = express.Router();

const createSchema = Joi.object({
  siteId: Joi.string().trim().required(),
  engineer: Joi.string().optional(),
  engineerName: Joi.string().trim().optional()
});

const updateChecklistItemSchema = Joi.object({
  completed: Joi.boolean().required(),
  remarks: Joi.string().allow('').optional()
});

router.post('/', auth, permission('commissioning'), validate(createSchema), commissioningController.createCommissioning);
router.get('/', auth, permission('commissioning'), commissioningController.getAllCommissioning);
router.get('/:siteId', auth, permission('commissioning'), commissioningController.getCommissioningBySite);
router.patch(
  '/:siteId/checklist/:itemId',
  auth,
  permission('commissioning'),
  validate(updateChecklistItemSchema),
  commissioningController.updateChecklistItem
);

export default router;
