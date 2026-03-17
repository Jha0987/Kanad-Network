import Site from '../models/Site.js';
import Alarm from '../models/Alarm.js';
import Commissioning from '../models/Commissioning.js';
import { INSTALLATION_STATUS, ALARM_SEVERITY, ALARM_STATUS } from '../utils/constants.js';

class SiteService {
  async createSite(siteData) {
    const existingSite = await Site.findOne({ siteId: siteData.siteId });
    if (existingSite) {
      throw { statusCode: 409, message: 'Site ID already exists', errorCode: 'SITE_EXISTS' };
    }

    const site = await Site.create(siteData);
    return site;
  }

  async getAllSites(filters = {}, page = 1, limit = 10, sort = '-createdAt') {
    const query = {};
    if (filters.vendor) query.vendor = filters.vendor;
    if (filters.status) query.installationStatus = filters.status;
    if (filters.siteId) query.siteId = new RegExp(filters.siteId, 'i');

    const sites = await Site.find(query)
      .populate('assignedEngineer', 'name email role')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Site.countDocuments(query);

    return {
      sites,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getSiteById(siteId) {
    const site = await Site.findOne({ siteId }).populate('assignedEngineer', 'name email role');
    if (!site) {
      throw { statusCode: 404, message: 'Site not found', errorCode: 'SITE_NOT_FOUND' };
    }
    return site;
  }

  async updateSite(siteId, updateData) {
    const site = await Site.findOne({ siteId });
    if (!site) {
      throw { statusCode: 404, message: 'Site not found', errorCode: 'SITE_NOT_FOUND' };
    }

    Object.assign(site, updateData);
    await site.save();
    return site;
  }

  async getMapView({ vendor }) {
    const matchSite = vendor ? { vendor } : {};

    const sites = await Site.find(matchSite, {
      siteId: 1,
      vendor: 1,
      installationStatus: 1,
      commissionedAt: 1,
      location: 1
    }).lean();

    const siteIds = sites.map((site) => site.siteId);

    const [alarms, commissioning] = await Promise.all([
      Alarm.aggregate([
        {
          $match: {
            siteId: { $in: siteIds },
            status: { $ne: ALARM_STATUS.RESOLVED }
          }
        },
        {
          $group: {
            _id: '$siteId',
            activeAlarms: { $sum: 1 },
            hasCritical: {
              $max: {
                $cond: [{ $eq: ['$severity', ALARM_SEVERITY.CRITICAL] }, 1, 0]
              }
            },
            hasMajor: {
              $max: {
                $cond: [{ $eq: ['$severity', ALARM_SEVERITY.MAJOR] }, 1, 0]
              }
            }
          }
        }
      ]),
      Commissioning.find({ siteId: { $in: siteIds } }, { siteId: 1, status: 1, isCommissioned: 1 }).lean()
    ]);

    const alarmMap = new Map(alarms.map((item) => [item._id, item]));
    const commissioningMap = new Map(commissioning.map((item) => [item.siteId, item]));

    return sites.map((site) => {
      const alarmData = alarmMap.get(site.siteId);
      const commData = commissioningMap.get(site.siteId);

      let health = 'green';
      if (alarmData?.hasCritical) health = 'red';
      else if (alarmData?.hasMajor) health = 'yellow';

      return {
        ...site,
        health,
        activeAlarms: alarmData?.activeAlarms || 0,
        commissioningStatus: commData?.status || 'Not Started',
        isCommissioned: commData?.isCommissioned || false
      };
    });
  }

  async getSiteStats() {
    const total = await Site.countDocuments();
    const commissioned = await Site.countDocuments({ installationStatus: INSTALLATION_STATUS.COMMISSIONED });
    const active = await Site.countDocuments({ installationStatus: INSTALLATION_STATUS.ACTIVE });
    const inProgress = await Site.countDocuments({ installationStatus: INSTALLATION_STATUS.IN_PROGRESS });

    const vendorStats = await Site.aggregate([{ $group: { _id: '$vendor', count: { $sum: 1 } } }]);

    return {
      total,
      commissioned,
      active,
      inProgress,
      vendorStats
    };
  }

  async deleteSite(siteId) {
    const site = await Site.findOneAndDelete({ siteId });
    if (!site) {
      throw { statusCode: 404, message: 'Site not found', errorCode: 'SITE_NOT_FOUND' };
    }
    return site;
  }
}

export default new SiteService();
