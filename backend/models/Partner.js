const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    required: true
  },
  logoFile: {
    type: String, // For base64 encoded images
    default: null
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['booking', 'travel', 'review', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

// Index for better performance
partnerSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Partner', partnerSchema);
