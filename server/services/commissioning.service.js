import Commissioning from '../models/Commissioning.js';
import Site from '../models/Site.js';
import auditService from './audit.service.js';
import { AUDIT_ACTIONS, INSTALLATION_STATUS } from '../utils/constants.js';

const DEFAULT_CHECKLIST = [
  { key: 'powerVerification', label: 'Power verification', completed: false },
  { key: 'fiberConnectivity', label: 'Fiber connectivity', completed: false },
  { key: 'gpsSync', label: 'GPS sync', completed: false },
  { key: 'parameterConfiguration', label: 'Parameter configuration', completed: false },
  { key: 'acceptanceTest', label: 'Acceptance test', completed: false }
];

class CommissioningService {
  async createCommissioning(data, user, reqMeta = {}) {
    const site = await Site.findOne({ siteId: data.siteId });
    if (!site) {
      throw { statusCode: 404, message: 'Site not found', errorCode: 'SITE_NOT_FOUND' };
    }

    const existing = await Commissioning.findOne({ siteId: data.siteId });
    if (existing) {
      throw { statusCode: 409, message: 'Commissioning already exists for this site', errorCode: 'COMMISSIONING_EXISTS' };
    }

    const engineer = data.engineer || user._id;
    const engineerName = data.engineerName || user.name;

    const commissioning = await Commissioning.create({
      siteId: data.siteId,
      engineer,
      engineerName,
      checklist: DEFAULT_CHECKLIST
    });

    await auditService.log({
      action: AUDIT_ACTIONS.CREATE,
      entity: 'Commissioning',
      entityId: commissioning._id.toString(),
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      changes: { before: null, after: commissioning.toObject() },
      description: `Commissioning started for site ${data.siteId}`,
      ipAddress: reqMeta.ip,
      userAgent: reqMeta.userAgent
    });

    return commissioning;
  }

  async getCommissioningBySite(siteId) {
    const commissioning = await Commissioning.findOne({ siteId })
      .populate('engineer', 'name email')
      .populate('checklist.completedBy', 'name email');

    if (!commissioning) {
      throw { statusCode: 404, message: 'Commissioning record not found', errorCode: 'NOT_FOUND' };
    }

    return commissioning;
  }

  async updateChecklistItem(siteId, itemId, payload, user, reqMeta = {}) {
    const commissioning = await Commissioning.findOne({ siteId });
    if (!commissioning) {
      throw { statusCode: 404, message: 'Commissioning record not found', errorCode: 'NOT_FOUND' };
    }

    const item = commissioning.checklist.id(itemId);
    if (!item) {
      throw { statusCode: 404, message: 'Checklist item not found', errorCode: 'ITEM_NOT_FOUND' };
    }

    const oldValue = {
      completed: item.completed,
      remarks: item.remarks
    };

    item.completed = Boolean(payload.completed);
    item.remarks = payload.remarks || item.remarks;
    item.completedBy = user._id;
    item.completedByName = user.name;
    item.completedAt = new Date();

    commissioning.auditTrail.push({
      action: 'CHECKLIST_UPDATE',
      itemKey: item.key,
      oldValue,
      newValue: { completed: item.completed, remarks: item.remarks },
      by: user._id,
      byName: user.name
    });

    await commissioning.save();

    if (commissioning.isCommissioned) {
      await Site.findOneAndUpdate(
        { siteId },
        {
          installationStatus: INSTALLATION_STATUS.COMMISSIONED,
          commissionedAt: commissioning.commissionedAt
        }
      );

      await auditService.log({
        action: AUDIT_ACTIONS.COMMISSION,
        entity: 'Site',
        entityId: siteId,
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        changes: {
          before: { installationStatus: INSTALLATION_STATUS.IN_PROGRESS },
          after: { installationStatus: INSTALLATION_STATUS.COMMISSIONED }
        },
        description: `Site ${siteId} auto-updated to Commissioned`,
        ipAddress: reqMeta.ip,
        userAgent: reqMeta.userAgent
      });
    }

    await auditService.log({
      action: AUDIT_ACTIONS.UPDATE,
      entity: 'Commissioning',
      entityId: commissioning._id.toString(),
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      changes: { before: oldValue, after: { completed: item.completed, remarks: item.remarks } },
      description: `Checklist item ${item.key} updated for site ${siteId}`,
      ipAddress: reqMeta.ip,
      userAgent: reqMeta.userAgent
    });

    return commissioning;
  }

  async getAllCommissioning(filters = {}, page = 1, limit = 10, sort = '-createdAt') {
    const query = {};
    if (filters.siteId) query.siteId = filters.siteId;
    if (filters.status) query.status = filters.status;

    const commissioning = await Commissioning.find(query)
      .populate('engineer', 'name email')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Commissioning.countDocuments(query);

    return {
      commissioning,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export default new CommissioningService();
