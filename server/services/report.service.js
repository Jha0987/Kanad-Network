import Alarm from '../models/Alarm.js';
import Site from '../models/Site.js';
import { ALARM_STATUS } from '../utils/constants.js';

class ReportService {
  buildDateRange(from, to) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { fromDate, toDate };
  }

  async getKpis({ from, to, vendor }) {
    const { fromDate, toDate } = this.buildDateRange(from, to);

    const alarmMatch = {
      raisedAt: { $gte: fromDate, $lte: toDate }
    };

    if (vendor) {
      const sites = await Site.find({ vendor }, { siteId: 1 });
      alarmMatch.siteId = { $in: sites.map((site) => site.siteId) };
    }

    const [mttrTrend, alarmBySeverity, siteRolloutProgress, slaStats] = await Promise.all([
      Alarm.aggregate([
        { $match: { ...alarmMatch, status: ALARM_STATUS.RESOLVED, mttr: { $gt: 0 } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$resolvedAt' } },
            avgMTTR: { $avg: '$mttr' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Alarm.aggregate([
        { $match: alarmMatch },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Site.aggregate([
        ...(vendor ? [{ $match: { vendor } }] : []),
        { $group: { _id: '$installationStatus', count: { $sum: 1 } } }
      ]),
      Alarm.aggregate([
        { $match: alarmMatch },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            breached: {
              $sum: {
                $cond: [{ $eq: ['$slaBreached', true] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const total = slaStats[0]?.total || 0;
    const breached = slaStats[0]?.breached || 0;

    return {
      filters: { fromDate, toDate, vendor: vendor || 'All' },
      mttrTrend: mttrTrend.map((item) => ({ date: item._id, mttr: Math.round(item.avgMTTR) })),
      alarmBySeverity: alarmBySeverity.map((item) => ({ severity: item._id, count: item.count })),
      siteRolloutProgress: siteRolloutProgress.map((item) => ({ status: item._id, count: item.count })),
      slaCompliance: {
        total,
        breached,
        compliant: Math.max(total - breached, 0),
        compliancePercent: total ? Math.round(((total - breached) / total) * 100) : 100
      }
    };
  }

  buildCsvReport(kpis) {
    const lines = [
      'Section,Metric,Value',
      ...kpis.mttrTrend.map((item) => `MTTR Trend,${item.date},${item.mttr}`),
      ...kpis.alarmBySeverity.map((item) => `Alarm Severity,${item.severity},${item.count}`),
      ...kpis.siteRolloutProgress.map((item) => `Site Rollout,${item.status},${item.count}`),
      `SLA,Compliance %,${kpis.slaCompliance.compliancePercent}`,
      `SLA,Total,${kpis.slaCompliance.total}`,
      `SLA,Breached,${kpis.slaCompliance.breached}`
    ];

    return lines.join('\n');
  }
}

export default new ReportService();
