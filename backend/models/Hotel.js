const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  type: { 
    type: String, 
    enum: ['hotel', 'resort'], 
    required: true 
  },
  location: { 
    type: String, 
    trim: true 
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  description: { 
    type: String,
    trim: true 
  },
  shortDescription: { 
    type: String,
    maxlength: 200,
    trim: true 
  },
  images: [{
    url: { type: String },
    alt: { type: String, default: '' },
    isMain: { type: Boolean, default: false }
  }],
  videoUrl: { type: String },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5 
  },
  reviewCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  features: [String], // المميزات العامة
  instructions: [String], // التعليمات الخاصة بالفندق
  amenities: [{
    title: { type: String },
    body: { type: String },
    icon: { type: String }, // أيقونة الميزة
    category: { 
      type: String, 
      enum: ['general', 'room', 'dining', 'recreation', 'business', 'transportation'],
      default: 'general'
    }
  }],
  policies: {
    checkIn: { type: String, default: '15:00' },
    checkOut: { type: String, default: '12:00' },
    cancellation: { type: String },
    pets: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false },
    children: { type: String, default: 'Children of all ages welcome' }
  },
  contact: {
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    whatsapp: { type: String },
    mapsUrl: { type: String },
    socialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String }
    }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'maintenance'], 
    default: 'active' 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  // إعدادات الحجز
  bookingSettings: {
    minStay: { type: Number, default: 1 }, // الحد الأدنى للإقامة
    maxStay: { type: Number, default: 30 }, // الحد الأقصى للإقامة
    advanceBooking: { type: Number, default: 365 }, // عدد الأيام المسموح بالحجز مسبقاً
    sameDayBooking: { type: Boolean, default: true } // السماح بالحجز في نفس اليوم
  },
  // إحصائيات
  stats: {
    totalRooms: { type: Number, default: 0 },
    totalChalets: { type: Number, default: 0 },
    occupancyRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
hotelSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street || ''} ${addr.city} ${addr.state || ''} ${addr.country}`.trim();
});

// Indexes for better performance
hotelSchema.index({ name: 'text', description: 'text', location: 'text' });
hotelSchema.index({ type: 1, status: 1 });
hotelSchema.index({ 'address.city': 1 });
hotelSchema.index({ isFeatured: 1, status: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);



