import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    enum: ['powerVerification', 'fiberConnectivity', 'gpsSync', 'parameterConfiguration', 'acceptanceTest']
  },
  label: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedByName: String,
  completedAt: Date,
  remarks: String
}, { _id: true });

const commissioningSchema = new mongoose.Schema({
  siteId: {
    type: String,
    required: true,
    ref: 'Site',
    unique: true,
    index: true
  },
  checklist: {
    type: [checklistItemSchema],
    validate: {
      validator: (items) => items.length === 5,
      message: 'Checklist must contain all five commissioning steps'
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Failed'],
    default: 'Pending',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCommissioned: {
    type: Boolean,
    default: false,
    index: true
  },
  engineer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  engineerName: {
    type: String,
    required: true
  },
  commissionedAt: Date,
  auditTrail: [{
    action: String,
    itemKey: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    byName: String,
    at: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

commissioningSchema.index({ createdAt: -1 });

commissioningSchema.methods.syncProgress = function() {
  if (!this.checklist.length) {
    this.progress = 0;
    this.status = 'Pending';
    this.isCommissioned = false;
    return;
  }

  const completedItems = this.checklist.filter((item) => item.completed).length;
  this.progress = Math.round((completedItems / this.checklist.length) * 100);
  this.isCommissioned = completedItems === this.checklist.length;

  if (this.isCommissioned) {
    this.status = 'Completed';
    if (!this.commissionedAt) {
      this.commissionedAt = new Date();
    }
  } else if (completedItems > 0) {
    this.status = 'In Progress';
    this.commissionedAt = undefined;
  } else {
    this.status = 'Pending';
    this.commissionedAt = undefined;
  }
};

commissioningSchema.pre('save', function(next) {
  this.syncProgress();
  next();
});

export default mongoose.model('Commissioning', commissioningSchema);
