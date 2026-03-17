import Configuration from '../models/Configuration.js';
import Site from '../models/Site.js';
import auditService from './audit.service.js';
import { AUDIT_ACTIONS } from '../utils/constants.js';

class ConfigurationService {
  async createConfiguration(data, user, reqMeta = {}) {
    const site = await Site.findOne({ siteId: data.siteId });
    if (!site) {
      throw { statusCode: 404, message: 'Site not found', errorCode: 'SITE_NOT_FOUND' };
    }

    const latestConfig = await Configuration.findOne({ siteId: data.siteId }).sort({ version: -1 });

    await Configuration.updateMany(
      { siteId: data.siteId, isActive: true },
      { $set: { isActive: false } }
    );

    const version = latestConfig ? latestConfig.version + 1 : 1;

    const configuration = await Configuration.create({
      siteId: data.siteId,
      version,
      parameters: data.parameters,
      previousVersion: latestConfig?.version,
      updatedBy: user._id,
      updatedAt: new Date(),
      isActive: true,
      changeReason: data.changeReason
    });

    await auditService.log({
      action: AUDIT_ACTIONS.CONFIG_CHANGE,
      entity: 'Configuration',
      entityId: configuration._id.toString(),
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      changes: {
        before: latestConfig?.parameters || null,
        after: configuration.parameters
      },
      description: `Configuration version ${version} created for site ${data.siteId}`,
      ipAddress: reqMeta.ip,
      userAgent: reqMeta.userAgent
    });

    return configuration;
  }

  async getLatestConfiguration(siteId) {
    const configuration = await Configuration.findOne({ siteId, isActive: true })
      .populate('updatedBy', 'name email');

    if (!configuration) {
      throw { statusCode: 404, message: 'Configuration not found', errorCode: 'NOT_FOUND' };
    }

    return configuration;
  }

  async getConfigurationHistory(siteId, page = 1, limit = 20) {
    const query = { siteId };
    const configurations = await Configuration.find(query)
      .sort({ version: -1 })
      .populate('updatedBy', 'name email')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Configuration.countDocuments(query);

    return {
      configurations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async compareVersions(siteId, version1, version2) {
    const [configA, configB] = await Promise.all([
      Configuration.findOne({ siteId, version: version1 }),
      Configuration.findOne({ siteId, version: version2 })
    ]);

    if (!configA || !configB) {
      throw { statusCode: 404, message: 'One or both versions not found', errorCode: 'NOT_FOUND' };
    }

    const fields = ['ipAddress', 'vlan', 'frequency', 'pci', 'softwareVersion'];
    const differences = fields
      .filter((field) => configA.parameters[field] !== configB.parameters[field])
      .map((field) => ({
        field,
        oldValue: configA.parameters[field],
        newValue: configB.parameters[field]
      }));

    return {
      siteId,
      version1: { version: configA.version, parameters: configA.parameters },
      version2: { version: configB.version, parameters: configB.parameters },
      differences
    };
  }

  async rollbackConfiguration(siteId, targetVersion, user, reqMeta = {}) {
    const targetConfig = await Configuration.findOne({ siteId, version: targetVersion });
    if (!targetConfig) {
      throw { statusCode: 404, message: 'Target version not found', errorCode: 'NOT_FOUND' };
    }

    const activeConfig = await Configuration.findOne({ siteId, isActive: true });
    const latestConfig = await Configuration.findOne({ siteId }).sort({ version: -1 });

    await Configuration.updateMany({ siteId, isActive: true }, { $set: { isActive: false } });

    const rolledBackConfig = await Configuration.create({
      siteId,
      version: latestConfig.version + 1,
      parameters: targetConfig.parameters,
      previousVersion: latestConfig.version,
      updatedBy: user._id,
      updatedAt: new Date(),
      isActive: true,
      changeReason: `Rollback to version ${targetVersion}`
    });

    await auditService.log({
      action: AUDIT_ACTIONS.ROLLBACK,
      entity: 'Configuration',
      entityId: rolledBackConfig._id.toString(),
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      changes: {
        before: activeConfig?.parameters || latestConfig?.parameters,
        after: rolledBackConfig.parameters
      },
      description: `Configuration rolled back to version ${targetVersion} for site ${siteId}`,
      ipAddress: reqMeta.ip,
      userAgent: reqMeta.userAgent
    });

    return rolledBackConfig;
  }
}

export default new ConfigurationService();
