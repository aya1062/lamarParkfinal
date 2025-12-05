const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  date: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Validate date format YYYY-MM-DD
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  available: {
    type: Boolean,
    default: true
  },
  reason: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to ensure unique pricing per property per date
pricingSchema.index({ property: 1, date: 1 }, { unique: true });

// Index for faster queries
pricingSchema.index({ property: 1 });
pricingSchema.index({ date: 1 });

module.exports = mongoose.model('Pricing', pricingSchema);
