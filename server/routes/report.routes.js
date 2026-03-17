import express from 'express';
import Joi from 'joi';
import * as reportController from '../controllers/report.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { permission } from '../middleware/permission.middleware.js';

const router = express.Router();

const querySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  vendor: Joi.string().optional()
});

router.get('/kpis', auth, permission('reports'), validate(querySchema, 'query'), reportController.getKpis);
router.get('/export/csv', auth, permission('reports'), validate(querySchema, 'query'), reportController.exportCsv);
router.get('/export/pdf', auth, permission('reports'), validate(querySchema, 'query'), reportController.exportPdf);

export default router;
