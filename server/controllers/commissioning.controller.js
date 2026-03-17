import commissioningService from '../services/commissioning.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const createCommissioning = async (req, res, next) => {
  try {
    const commissioning = await commissioningService.createCommissioning(req.body, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Commissioning record created successfully',
      data: { commissioning }
    });
  } catch (error) {
    next(error);
  }
};

export const getCommissioningBySite = async (req, res, next) => {
  try {
    const commissioning = await commissioningService.getCommissioningBySite(req.params.siteId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { commissioning }
    });
  } catch (error) {
    next(error);
  }
};

export const updateChecklistItem = async (req, res, next) => {
  try {
    const commissioning = await commissioningService.updateChecklistItem(
      req.params.siteId,
      req.params.itemId,
      req.body,
      req.user,
      {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Checklist item updated successfully',
      data: { commissioning }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCommissioning = async (req, res, next) => {
  try {
    const { siteId, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const result = await commissioningService.getAllCommissioning(
      { siteId, status },
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
