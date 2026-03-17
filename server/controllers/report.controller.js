import reportService from '../services/report.service.js';
import { buildSimplePdf } from '../utils/pdf.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const getKpis = async (req, res, next) => {
  try {
    const kpis = await reportService.getKpis(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: kpis
    });
  } catch (error) {
    next(error);
  }
};

export const exportCsv = async (req, res, next) => {
  try {
    const kpis = await reportService.getKpis(req.query);
    const csv = reportService.buildCsvReport(kpis);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="telecom-noc-report.csv"');
    res.status(HTTP_STATUS.OK).send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportPdf = async (req, res, next) => {
  try {
    const kpis = await reportService.getKpis(req.query);

    const text = [
      'Kanad Networks KPI Report',
      `Date Range: ${new Date(kpis.filters.fromDate).toISOString().slice(0, 10)} to ${new Date(kpis.filters.toDate).toISOString().slice(0, 10)}`,
      `Vendor: ${kpis.filters.vendor}`,
      '',
      `SLA Compliance: ${kpis.slaCompliance.compliancePercent}%`,
      `Total Alarms: ${kpis.slaCompliance.total}`,
      `Breached: ${kpis.slaCompliance.breached}`,
      '',
      'Alarm Count by Severity:',
      ...kpis.alarmBySeverity.map((item) => `${item.severity}: ${item.count}`),
      '',
      'Site Rollout:',
      ...kpis.siteRolloutProgress.map((item) => `${item.status}: ${item.count}`)
    ].join('\n');

    const pdfBuffer = buildSimplePdf(text);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="telecom-noc-report.pdf"');
    res.status(HTTP_STATUS.OK).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
