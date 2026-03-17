import Alarm from '../models/Alarm.js';
import Site from '../models/Site.js';
import auditService from './audit.service.js';
import { ALARM_STATUS, ALARM_SEVERITY, AUDIT_ACTIONS, ROLES } from '../utils/constants.js';

const SIMULATED_ALARMS = [
  'Power Failure',
  'Fiber Link Down',
  'GPS Sync Lost',
  'High VSWR',
  'Packet Loss',
  'Temperature High'
];

class AlarmService {
  async createAlarm(alarmData, user, reqMeta = {}) {
    const alarm = await Alarm.create(alarmData);

    if (user) {
      await auditService.log({
        action: AUDIT_ACTIONS.CREATE,
        entity: 'Alarm',
        entityId: alarm._id.toString(),
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        changes: { before: null, after: alarm.toObject() },
        description: `Alarm ${alarm.alarmType} created for site ${alarm.siteId}`,
        ipAddress: reqMeta.ip,
        userAgent: reqMeta.userAgent
      });
    }

    return alarm;
  }

  async getAllAlarms(filters = {}, page = 1, limit = 10, sort = '-raisedAt') {
    const query = {};
    if (filters.severity) query.severity = filters.severity;
    if (filters.status) query.status = filters.status;
    if (filters.siteId) query.siteId = filters.siteId;
    if (filters.slaBreached !== undefined) query.slaBreached = filters.slaBreached === 'true';

    const alarms = await Alarm.find(query)
      .populate('assignedEngineer', 'name email role')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Alarm.countDocuments(query);

    return {
      alarms,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getAlarmById(id) {
    const alarm = await Alarm.findById(id).populate('assignedEngineer', 'name email role');
    if (!alarm) {
      throw { statusCode: 404, message: 'Alarm not found', errorCode: 'ALARM_NOT_FOUND' };
    }
    return alarm;
  }

  async updateAlarm(id, updateData, user, reqMeta = {}) {
    const alarm = await Alarm.findById(id);
    if (!alarm) {
      throw { statusCode: 404, message: 'Alarm not found', errorCode: 'ALARM_NOT_FOUND' };
    }

    const before = alarm.toObject();

    if (updateData.status === ALARM_STATUS.IN_PROGRESS && !alarm.acknowledgedAt) {
      alarm.acknowledgedAt = new Date();
    }

    if (updateData.status === ALARM_STATUS.RESOLVED && !alarm.resolvedAt) {
      alarm.resolvedAt = new Date();
    }

    Object.assign(alarm, updateData);
    await alarm.save();

    await auditService.log({
      action: alarm.status === ALARM_STATUS.RESOLVED ? AUDIT_ACTIONS.RESOLVE_ALARM : AUDIT_ACTIONS.UPDATE,
      entity: 'Alarm',
      entityId: alarm._id.toString(),
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      changes: { before, after: alarm.toObject() },
      description: `Alarm ${alarm._id} updated`,
      ipAddress: reqMeta.ip,
      userAgent: reqMeta.userAgent
    });

    return alarm;
  }

  async assignEngineer(id, engineerId, user, reqMeta = {}) {
    const alarm = await Alarm.findById(id);
    if (!alarm) {
      throw { statusCode: 404, message: 'Alarm not found', errorCode: 'ALARM_NOT_FOUND' };
    }

    const before = alarm.toObject();

    alarm.assignedEngineer = engineerId;
    alarm.status = ALARM_STATUS.IN_PROGRESS;
    alarm.acknowledgedAt = new Date();

    await alarm.save();

    await auditService.log({
      action: AUDIT_ACTIONS.ASSIGN_ENGINEER,
      entity: 'Alarm',
      entityId: alarm._id.toString(),
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      changes: { before, after: alarm.toObject() },
      description: `Engineer assigned to alarm ${alarm._id}`,
      ipAddress: reqMeta.ip,
      userAgent: reqMeta.userAgent
    });

    return alarm;
  }

  async getAlarmStats() {
    const [total, active, critical, breachedCount, avgMttrResult, severityStats] = await Promise.all([
      Alarm.countDocuments(),
      Alarm.countDocuments({ status: { $ne: ALARM_STATUS.RESOLVED } }),
      Alarm.countDocuments({ severity: ALARM_SEVERITY.CRITICAL, status: { $ne: ALARM_STATUS.RESOLVED } }),
      Alarm.countDocuments({ slaBreached: true }),
      Alarm.aggregate([
        { $match: { status: ALARM_STATUS.RESOLVED, mttr: { $gt: 0 } } },
        { $group: { _id: null, avgMTTR: { $avg: '$mttr' } } }
      ]),
      Alarm.aggregate([
        { $match: { status: { $ne: ALARM_STATUS.RESOLVED } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ])
    ]);

    const avgMTTR = avgMttrResult[0]?.avgMTTR ? Math.round(avgMttrResult[0].avgMTTR) : 0;
    const slaCompliance = total > 0 ? Math.round(((total - breachedCount) / total) * 100) : 100;

    return {
      total,
      active,
      critical,
      avgMTTR,
      slaCompliance,
      breachedCount,
      severityStats
    };
  }

  async getMttrTrend(fromDate, toDate) {
    return Alarm.aggregate([
      {
        $match: {
          status: ALARM_STATUS.RESOLVED,
          resolvedAt: {
            $gte: fromDate,
            $lte: toDate
          },
          mttr: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$resolvedAt' } },
          avgMTTR: { $avg: '$mttr' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  async runAgingAndEscalation(io) {
    const activeAlarms = await Alarm.find({ status: { $ne: ALARM_STATUS.RESOLVED } });

    for (const alarm of activeAlarms) {
      const agingMinutes = alarm.calculateAgingMinutes();
      const shouldBreach = agingMinutes > alarm.slaThreshold;

      if (shouldBreach && !alarm.slaBreached) {
        alarm.slaBreached = true;
      }

      if (alarm.slaBreached && alarm.escalationRule.autoEscalate && !alarm.escalated) {
        alarm.escalated = true;
        alarm.escalatedAt = new Date();
        alarm.escalationRule.targetRole = ROLES.MANAGER;

        io.to('alarms').emit('alarm:escalated', {
          alarmId: alarm._id,
          siteId: alarm.siteId,
          severity: alarm.severity,
          targetRole: alarm.escalationRule.targetRole,
          agingMinutes,
          slaThreshold: alarm.slaThreshold
        });

        await auditService.log({
          action: AUDIT_ACTIONS.ESCALATE,
          entity: 'Alarm',
          entityId: alarm._id.toString(),
          userId: alarm.assignedEngineer,
          userName: 'System',
          userRole: 'System',
          changes: { before: { escalated: false }, after: { escalated: true } },
          description: `Alarm ${alarm._id} escalated due to SLA breach`
        });
      }

      if (alarm.severity === ALARM_SEVERITY.CRITICAL && !alarm.notificationSent) {
        io.to('alarms').emit('alarm:critical-notification', {
          alarmId: alarm._id,
          siteId: alarm.siteId,
          alarmType: alarm.alarmType,
          raisedAt: alarm.raisedAt
        });
        alarm.notificationSent = true;
      }

      await alarm.save();
    }
  }

  async simulateRandomAlarms(count = 5, user, io) {
    const sites = await Site.find({}, { siteId: 1 });
    if (!sites.length) {
      throw { statusCode: 400, message: 'No sites available for simulation', errorCode: 'NO_SITES' };
    }

    const severities = Object.values(ALARM_SEVERITY);
    const created = [];

    for (let idx = 0; idx < count; idx += 1) {
      const randomSite = sites[Math.floor(Math.random() * sites.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const alarmType = SIMULATED_ALARMS[Math.floor(Math.random() * SIMULATED_ALARMS.length)];

      const alarm = await Alarm.create({
        siteId: randomSite.siteId,
        alarmType,
        severity,
        status: ALARM_STATUS.OPEN,
        description: `Simulated ${alarmType} alarm`
      });

      created.push(alarm);
      io.to('alarms').emit('alarm:new', alarm);
    }

    if (user) {
      await auditService.log({
        action: AUDIT_ACTIONS.CREATE,
        entity: 'Simulation',
        entityId: `simulation-${Date.now()}`,
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        description: `${created.length} simulated alarms generated`,
        metadata: { alarmIds: created.map((item) => item._id.toString()) }
      });
    }

    return created;
  }

  async deleteAlarm(id) {
    const alarm = await Alarm.findByIdAndDelete(id);
    if (!alarm) {
      throw { statusCode: 404, message: 'Alarm not found', errorCode: 'ALARM_NOT_FOUND' };
    }
    return alarm;
  }
}

export default new AlarmService();
