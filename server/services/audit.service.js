import AuditLog from '../models/AuditLog.js';

class AuditService {
  async log(payload) {
    try {
      await AuditLog.create(payload);
    } catch (error) {
      console.error('Audit log error:', error.message);
    }
  }

  async getAuditLogs(filters = {}, page = 1, limit = 50, sort = '-createdAt') {
    const query = {};

    if (filters.entity) query.entity = filters.entity;
    if (filters.entityId) query.entityId = filters.entityId;
    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getEntityHistory(entity, entityId) {
    return AuditLog.find({ entity, entityId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
  }
}

export default new AuditService();
