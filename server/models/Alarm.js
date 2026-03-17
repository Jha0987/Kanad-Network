import mongoose from 'mongoose';
import { ALARM_SEVERITY, ALARM_STATUS } from '../utils/constants.js';

const alarmSchema = new mongoose.Schema({
  siteId: {
    type: String,
    required: [true, 'Site ID is required'],
    ref: 'Site',
    index: true
  },
  alarmType: {
    type: String,
    required: [true, 'Alarm type is required'],
    trim: true
  },
  severity: {
    type: String,
    enum: Object.values(ALARM_SEVERITY),
    required: [true, 'Severity is required'],
    index: true
  },
  status: {
    type: String,
    enum: Object.values(ALARM_STATUS),
    default: ALARM_STATUS.OPEN,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  assignedEngineer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  raisedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  acknowledgedAt: Date,
  resolvedAt: Date,
  mttr: {
    type: Number,
    default: 0
  },
  slaThreshold: {
    type: Number,
    default: function() {
      if (this.severity === ALARM_SEVERITY.CRITICAL) return 60;
      if (this.severity === ALARM_SEVERITY.MAJOR) return 240;
      return 480;
    }
  },
  slaBreached: {
    type: Boolean,
    default: false,
    index: true
  },
  escalationRule: {
    level: { type: Number, default: 1 },
    targetRole: { type: String, default: 'Manager' },
    autoEscalate: { type: Boolean, default: true }
  },
  escalated: {
    type: Boolean,
    default: false,
    index: true
  },
  escalatedAt: Date,
  rootCauseTags: [{ type: String, trim: true }],
  rootCause: String,
  resolution: String,
  notes: String,
  lastAgingUpdateAt: Date,
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

alarmSchema.index({ severity: 1, status: 1, raisedAt: -1 });
alarmSchema.index({ slaBreached: 1, escalated: 1, status: 1 });

alarmSchema.methods.calculateMTTR = function() {
  if (!this.resolvedAt || !this.raisedAt) return 0;
  return Math.round((this.resolvedAt - this.raisedAt) / (1000 * 60));
};

alarmSchema.methods.calculateAgingMinutes = function() {
  const end = this.status === ALARM_STATUS.RESOLVED && this.resolvedAt
    ? this.resolvedAt
    : new Date();
  return Math.max(0, Math.round((end - this.raisedAt) / (1000 * 60)));
};

alarmSchema.pre('save', function(next) {
  if (this.status === ALARM_STATUS.RESOLVED && this.resolvedAt) {
    this.mttr = this.calculateMTTR();
  }

  const agingMinutes = this.calculateAgingMinutes();
  this.slaBreached = this.status !== ALARM_STATUS.RESOLVED && agingMinutes > this.slaThreshold;
  this.lastAgingUpdateAt = new Date();

  next();
});

export default mongoose.model('Alarm', alarmSchema);
