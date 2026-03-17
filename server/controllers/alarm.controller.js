import alarmService from '../services/alarm.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const createAlarm = async (req, res, next) => {
  try {
    const alarm = await alarmService.createAlarm(req.body, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    req.io.to('alarms').emit('alarm:new', alarm);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Alarm created successfully',
      data: { alarm }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAlarms = async (req, res, next) => {
  try {
    const { severity, status, siteId, slaBreached, page = 1, limit = 10, sort = '-raisedAt' } = req.query;
    const result = await alarmService.getAllAlarms(
      { severity, status, siteId, slaBreached },
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

export const getAlarmById = async (req, res, next) => {
  try {
    const alarm = await alarmService.getAlarmById(req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { alarm }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAlarm = async (req, res, next) => {
  try {
    const alarm = await alarmService.updateAlarm(req.params.id, req.body, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    req.io.to('alarms').emit('alarm:updated', alarm);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Alarm updated successfully',
      data: { alarm }
    });
  } catch (error) {
    next(error);
  }
};

export const assignEngineer = async (req, res, next) => {
  try {
    const alarm = await alarmService.assignEngineer(req.params.id, req.body.engineerId, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    req.io.to('alarms').emit('alarm:assigned', alarm);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Engineer assigned successfully',
      data: { alarm }
    });
  } catch (error) {
    next(error);
  }
};

export const getAlarmStats = async (req, res, next) => {
  try {
    const stats = await alarmService.getAlarmStats();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const simulateAlarms = async (req, res, next) => {
  try {
    const count = Number(req.body.count || 5);
    const alarms = await alarmService.simulateRandomAlarms(count, req.user, req.io);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: `${alarms.length} alarms simulated`,
      data: { alarms }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAlarm = async (req, res, next) => {
  try {
    await alarmService.deleteAlarm(req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Alarm deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
