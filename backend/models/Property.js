const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['hotel', 'chalet', 'room'], required: true },
  // ربط الشاليه/الغرفة بالفندق/المنتجع
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  images: [String],
  videoUrl: { type: String },
  features: [String],
  amenities: [{
    title: { type: String },
    body: { type: String }
  }],
  description: { type: String },
  available: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  // إعدادات خاصة بالشاليه
  chaletSettings: {
    maxOccupancy: { type: Number, default: 6 },
    bedrooms: { type: Number, default: 2 },
    bathrooms: { type: Number, default: 2 },
    size: { type: Number }, // المساحة بالمتر المربع
    floor: { type: Number },
    hasPool: { type: Boolean, default: false },
    hasGarden: { type: Boolean, default: false },
    hasKitchen: { type: Boolean, default: true },
    hasParking: { type: Boolean, default: true }
  },
  // إعدادات خاصة بالغرفة (ستوك وتسعير ومواصفات)
  roomSettings: {
    specifications: {
      size: { type: Number },
      floor: { type: Number },
      view: { type: String, enum: ['city', 'garden', 'pool', 'sea', 'mountain', 'interior'], default: 'interior' },
      bedType: { type: String, enum: ['single', 'double', 'queen', 'king', 'twin', 'sofa_bed'] },
      maxOccupancy: { type: Number, min: 1, max: 10 },
      maxAdults: { type: Number, min: 1 },
      maxChildren: { type: Number, min: 0, default: 0 }
    },
    pricing: {
      basePrice: { type: Number, min: 0 },
      currency: { type: String, default: 'SAR', enum: ['SAR', 'USD', 'EUR'] },
      extraPersonPrice: { type: Number, default: 0 },
      extraBedPrice: { type: Number, default: 0 },
      weeklyDiscount: { type: Number, default: 0 },
      monthlyDiscount: { type: Number, default: 0 }
    },
    availability: {
      isActive: { type: Boolean, default: true },
      totalUnits: { type: Number, default: 1, min: 1 },
      availableUnits: { type: Number, default: 1, min: 0 }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
propertySchema.index({ hotel: 1, type: 1, status: 1 });
propertySchema.index({ type: 1, status: 1 });
propertySchema.index({ location: 'text', name: 'text' });

module.exports = mongoose.model('Property', propertySchema);
