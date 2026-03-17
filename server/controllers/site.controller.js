import siteService from '../services/site.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const createSite = async (req, res, next) => {
  try {
    const site = await siteService.createSite(req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Site created successfully',
      data: { site }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSites = async (req, res, next) => {
  try {
    const { vendor, status, siteId, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const result = await siteService.getAllSites(
      { vendor, status, siteId },
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

export const getSiteById = async (req, res, next) => {
  try {
    const site = await siteService.getSiteById(req.params.siteId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { site }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSite = async (req, res, next) => {
  try {
    const site = await siteService.updateSite(req.params.siteId, req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Site updated successfully',
      data: { site }
    });
  } catch (error) {
    next(error);
  }
};

export const getMapView = async (req, res, next) => {
  try {
    const mapData = await siteService.getMapView(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { sites: mapData }
    });
  } catch (error) {
    next(error);
  }
};

export const getSiteStats = async (req, res, next) => {
  try {
    const stats = await siteService.getSiteStats();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSite = async (req, res, next) => {
  try {
    await siteService.deleteSite(req.params.siteId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Site deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
