import dashboardService from '../services/dashboard.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const metrics = await dashboardService.getDashboardMetrics(forceRefresh);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

export const getChartData = async (req, res, next) => {
  try {
    const chartData = await dashboardService.getChartData();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};
