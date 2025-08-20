const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  price: { 
    type: Number, 
    required: function() { return this.available !== false; } 
  },
  discountPrice: { type: Number }, // سعر الخصم (اختياري)
  available: { type: Boolean, default: true },
  reason: { type: String }
});

module.exports = mongoose.model('Pricing', pricingSchema); 