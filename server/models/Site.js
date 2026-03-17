import mongoose from 'mongoose';
import { INSTALLATION_STATUS } from '../utils/constants.js';

const siteSchema = new mongoose.Schema({
  siteId: {
    type: String,
    required: [true, 'Site ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  vendor: {
    type: String,
    required: [true, 'Vendor is required'],
    trim: true,
    index: true
  },
  equipment: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    installed: { type: Boolean, default: false }
  }],
  installationStatus: {
    type: String,
    enum: Object.values(INSTALLATION_STATUS),
    default: INSTALLATION_STATUS.PLANNED,
    index: true
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  assignedEngineer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  commissionedAt: Date,
  notes: String
}, {
  timestamps: true
});

siteSchema.index({ 'location.geo': '2dsphere' });
siteSchema.index({ vendor: 1, installationStatus: 1 });

siteSchema.methods.calculateCompletion = function() {
  if (!this.equipment || this.equipment.length === 0) return 0;
  const installed = this.equipment.filter((item) => item.installed).length;
  return Math.round((installed / this.equipment.length) * 100);
};

siteSchema.pre('save', function(next) {
  this.completionPercentage = this.calculateCompletion();
  this.location.geo = {
    type: 'Point',
    coordinates: [this.location.lng, this.location.lat]
  };
  next();
});

export default mongoose.model('Site', siteSchema);
