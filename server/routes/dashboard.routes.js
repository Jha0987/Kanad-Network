import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { permission } from '../middleware/permission.middleware.js';

const router = express.Router();

router.get('/metrics', auth, permission('dashboard'), dashboardController.getDashboardMetrics);
router.get('/charts', auth, permission('dashboard'), dashboardController.getChartData);

export default router;
