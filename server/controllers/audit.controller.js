import auditService from '../services/audit.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { entity, entityId, userId, action, startDate, endDate, page = 1, limit = 50, sort = '-createdAt' } = req.query;

    const result = await auditService.getAuditLogs(
      { entity, entityId, userId, action, startDate, endDate },
      Number(page),
      Number(limit),
      sort
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
