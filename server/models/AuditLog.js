import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'COMMISSION',
      'RESOLVE_ALARM',
      'CONFIG_CHANGE',
      'ROLLBACK',
      'ASSIGN_ENGINEER',
      'ESCALATE'
    ],
    index: true
  },
  entity: {
    type: String,
    required: true,
    enum: ['Site', 'Alarm', 'Configuration', 'Commissioning', 'User', 'Simulation'],
    index: true
  },
  entityId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: String,
  userRole: String,
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  description: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
