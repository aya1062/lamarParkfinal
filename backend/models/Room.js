const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomNumber: { 
    type: String, 
    required: true,
    trim: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  type: { 
    type: String, 
    enum: ['standard', 'deluxe', 'suite', 'presidential', 'family', 'executive'],
    required: true 
  },
  description: { 
    type: String,
    required: true,
    trim: true 
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isMain: { type: Boolean, default: false }
  }],
  // مواصفات الغرفة
  specifications: {
    size: { type: Number }, // المساحة بالمتر المربع
    floor: { type: Number },
    view: { 
      type: String, 
      enum: ['city', 'garden', 'pool', 'sea', 'mountain', 'interior'],
      default: 'interior'
    },
    bedType: { 
      type: String, 
      enum: ['single', 'double', 'queen', 'king', 'twin', 'sofa_bed'],
      required: true 
    },
    maxOccupancy: { 
      type: Number, 
      required: true,
      min: 1,
      max: 10 
    },
    maxAdults: { 
      type: Number, 
      required: true,
      min: 1 
    },
    maxChildren: { 
      type: Number, 
      default: 0,
      min: 0 
    }
  },
  // المرافق
  amenities: [{
    title: { type: String, required: true },
    body: { type: String, required: true },
    icon: { type: String }
  }],
  // التسعير
  pricing: {
    basePrice: { 
      type: Number, 
      required: true,
      min: 0 
    },
    currency: { 
      type: String, 
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR']
    },
    // أسعار إضافية
    extraPersonPrice: { type: Number, default: 0 },
    extraBedPrice: { type: Number, default: 0 },
    // خصومات
    weeklyDiscount: { type: Number, default: 0 }, // خصم أسبوعي
    monthlyDiscount: { type: Number, default: 0 } // خصم شهري
  },
  // نظام الرصيد والتوفر
  availability: {
    isActive: { type: Boolean, default: true },
    totalRooms: { 
      type: Number, 
      required: true,
      min: 1,
      default: 1 
    },
    availableRooms: { 
      type: Number, 
      required: true,
      min: 0,
      default: 1 
    },
    // إعدادات الحجز
    minStay: { type: Number, default: 1 },
    maxStay: { type: Number, default: 30 },
    advanceBooking: { type: Number, default: 365 },
    sameDayBooking: { type: Boolean, default: true },
    // أيام الأسبوع المتاحة
    availableDays: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true }
    }
  },
  // إعدادات الإدارة
  management: {
    isFeatured: { type: Boolean, default: false },
    priority: { type: Number, default: 0 }, // أولوية العرض
    notes: { type: String }, // ملاحظات الإدارة
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'maintenance', 'out_of_order'], 
    default: 'active' 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
roomSchema.virtual('occupancyRate').get(function() {
  if (this.availability.totalRooms === 0) return 0;
  return ((this.availability.totalRooms - this.availability.availableRooms) / this.availability.totalRooms) * 100;
});

roomSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && 
         this.availability.isActive && 
         this.availability.availableRooms > 0;
});

// Indexes for better performance
roomSchema.index({ hotel: 1, status: 1 });
roomSchema.index({ 'specifications.bedType': 1 });
roomSchema.index({ 'specifications.maxOccupancy': 1 });
roomSchema.index({ 'pricing.basePrice': 1 });
roomSchema.index({ 'availability.isActive': 1, 'availability.availableRooms': 1 });
roomSchema.index({ 'management.isFeatured': 1, status: 1 });

// Middleware to update availableRooms when totalRooms changes
roomSchema.pre('save', function(next) {
  if (this.isModified('availability.totalRooms')) {
    // إذا زاد العدد الإجمالي، أضف الفرق للغرف المتاحة
    const diff = this.availability.totalRooms - (this.availability.availableRooms + (this.availability.totalRooms - this.availability.availableRooms));
    if (diff > 0) {
      this.availability.availableRooms += diff;
    }
    // تأكد من أن الغرف المتاحة لا تتجاوز الإجمالي
    if (this.availability.availableRooms > this.availability.totalRooms) {
      this.availability.availableRooms = this.availability.totalRooms;
    }
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);

