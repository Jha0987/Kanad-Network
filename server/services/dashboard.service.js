import Site from '../models/Site.js';
import Alarm from '../models/Alarm.js';
import cacheService from './cache.service.js';
import { INSTALLATION_STATUS, ALARM_STATUS } from '../utils/constants.js';

class DashboardService {
  async getDashboardMetrics(forceRefresh = false) {
    const cacheKey = 'dashboard:metrics';

    if (!forceRefresh) {
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;
    }

    const [siteStats, alarmStats] = await Promise.all([
      this.getSiteMetrics(),
      this.getAlarmMetrics()
    ]);

    const payload = {
      ...siteStats,
      ...alarmStats
    };

    await cacheService.set(cacheKey, payload, 60);
    return payload;
  }

  async getSiteMetrics() {
    const [totalSites, commissionedSites] = await Promise.all([
      Site.countDocuments(),
      Site.countDocuments({
        installationStatus: {
          $in: [INSTALLATION_STATUS.COMMISSIONED, INSTALLATION_STATUS.ACTIVE]
        }
      })
    ]);

    const completionRate = totalSites > 0 ? Math.round((commissionedSites / totalSites) * 100) : 0;

    return {
      totalSites,
      commissionedSites,
      completionRate
    };
  }

  async getAlarmMetrics() {
    const [activeAlarms, criticalAlarms, breachedCount, mttrResult, totalAlarms] = await Promise.all([
      Alarm.countDocuments({ status: { $ne: ALARM_STATUS.RESOLVED } }),
      Alarm.countDocuments({ severity: 'Critical', status: { $ne: ALARM_STATUS.RESOLVED } }),
      Alarm.countDocuments({ slaBreached: true }),
      Alarm.aggregate([
        { $match: { status: ALARM_STATUS.RESOLVED, mttr: { $gt: 0 } } },
        { $group: { _id: null, avgMTTR: { $avg: '$mttr' } } }
      ]),
      Alarm.countDocuments()
    ]);

    const avgMTTR = mttrResult[0]?.avgMTTR ? Math.round(mttrResult[0].avgMTTR) : 0;
    const slaCompliance = totalAlarms ? Math.round(((totalAlarms - breachedCount) / totalAlarms) * 100) : 100;

    return {
      activeAlarms,
      criticalAlarms,
      avgMTTR,
      slaCompliance
    };
  }

  async getChartData() {
    const [alarmTrend, severityDistribution, siteRollout] = await Promise.all([
      Alarm.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$raisedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]),
      Alarm.aggregate([
        { $match: { status: { $ne: ALARM_STATUS.RESOLVED } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Site.aggregate([
        { $group: { _id: '$installationStatus', count: { $sum: 1 } } }
      ])
    ]);

    return {
      alarmTrend,
      severityDistribution,
      siteRollout
    };
  }
}

export default new DashboardService();
