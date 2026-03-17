import mongoose from 'mongoose';

const configurationSchema = new mongoose.Schema({
  siteId: {
    type: String,
    required: true,
    ref: 'Site',
    index: true
  },
  version: {
    type: Number,
    required: true
  },
  parameters: {
    ipAddress: { type: String, required: true },
    vlan: { type: String, required: true },
    frequency: { type: String, required: true },
    pci: { type: String, required: true },
    softwareVersion: { type: String, required: true }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  changeReason: {
    type: String,
    trim: true
  },
  previousVersion: Number,
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

configurationSchema.index({ siteId: 1, version: -1 }, { unique: true });
configurationSchema.index({ siteId: 1, isActive: 1 });

export default mongoose.model('Configuration', configurationSchema);
