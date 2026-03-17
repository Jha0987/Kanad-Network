import express from 'express';
import Joi from 'joi';
import * as siteController from '../controllers/site.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { permission } from '../middleware/permission.middleware.js';

const router = express.Router();

const siteSchema = Joi.object({
  siteId: Joi.string().required(),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    address: Joi.string().required()
  }).required(),
  vendor: Joi.string().required(),
  equipment: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    installed: Joi.boolean().optional()
  })).default([]),
  installationStatus: Joi.string().optional(),
  notes: Joi.string().allow('').optional()
});

const updateSchema = Joi.object({
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
    address: Joi.string().optional()
  }).optional(),
  vendor: Joi.string().optional(),
  installationStatus: Joi.string().optional(),
  notes: Joi.string().allow('').optional()
});

router.post('/', auth, permission('sites'), validate(siteSchema), siteController.createSite);
router.get('/', auth, permission('sites'), siteController.getAllSites);
router.get('/stats', auth, permission('sites'), siteController.getSiteStats);
router.get('/map-view', auth, permission('map'), siteController.getMapView);
router.get('/:siteId', auth, permission('sites'), siteController.getSiteById);
router.put('/:siteId', auth, permission('sites'), validate(updateSchema), siteController.updateSite);
router.delete('/:siteId', auth, permission('sites'), siteController.deleteSite);

export default router;
