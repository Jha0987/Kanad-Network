import configurationService from '../services/configuration.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const createConfiguration = async (req, res, next) => {
  try {
    const configuration = await configurationService.createConfiguration(req.body, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Configuration created successfully',
      data: { configuration }
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestConfiguration = async (req, res, next) => {
  try {
    const configuration = await configurationService.getLatestConfiguration(req.params.siteId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { configuration }
    });
  } catch (error) {
    next(error);
  }
};

export const getConfigurationHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await configurationService.getConfigurationHistory(
      req.params.siteId,
      Number(page),
      Number(limit)
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const compareVersions = async (req, res, next) => {
  try {
    const comparison = await configurationService.compareVersions(
      req.params.siteId,
      Number(req.query.version1),
      Number(req.query.version2)
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
};

export const rollbackConfiguration = async (req, res, next) => {
  try {
    const configuration = await configurationService.rollbackConfiguration(
      req.params.siteId,
      Number(req.body.targetVersion),
      req.user,
      {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Configuration rolled back successfully',
      data: { configuration }
    });
  } catch (error) {
    next(error);
  }
};
