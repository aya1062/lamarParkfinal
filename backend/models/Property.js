const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['hotel', 'chalet'], required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  images: [String],
  videoUrl: { type: String },
  features: [String],
  amenities: [{
    title: { type: String, required: true },
    body: { type: String, required: true }
  }],
  description: { type: String },
  available: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('Property', propertySchema);
