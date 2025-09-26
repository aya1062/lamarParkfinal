const mongoose = require('mongoose');

const roomBookingSchema = new mongoose.Schema({
  // بيانات الضيف
  guest: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    nationality: { type: String, trim: true },
    idNumber: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, trim: true }
    }
  },
  // بيانات المستخدم (إذا كان مسجل)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // بيانات الفندق والغرفة
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  // تفاصيل الحجز
  bookingDetails: {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    infants: { type: Number, default: 0, min: 0 },
    roomCount: { type: Number, default: 1, min: 1 }
  },
  // التسعير
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    extraPersonPrice: { type: Number, default: 0 },
    extraBedPrice: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'SAR' }
  },
  // حالة الحجز
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
    default: 'pending' 
  },
  // حالة الدفع
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'paid', 'partially_paid', 'refunded', 'failed'], 
    default: 'unpaid' 
  },
  // طريقة الدفع
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'bank_transfer', 'cash_on_arrival'], 
    default: 'cash' 
  },
  // تفاصيل الدفع
  payment: {
    transactionId: { type: String },
    amount: { type: Number },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed }
  },
  // طلبات خاصة
  specialRequests: {
    type: String,
    maxlength: 500
  },
  // ملاحظات الإدارة
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  // تاريخ الحجز
  bookingDate: { 
    type: Date, 
    default: Date.now 
  },
  // رقم الحجز الفريد
  bookingNumber: { 
    type: String, 
    unique: true,
    required: true
  },
  // تأكيد الحجز
  confirmation: {
    sent: { type: Boolean, default: false },
    sentDate: { type: Date },
    method: { type: String, enum: ['email', 'sms', 'both'] }
  },
  // إلغاء الحجز
  cancellation: {
    cancelled: { type: Boolean, default: false },
    cancelledDate: { type: Date },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: { type: String },
    refundAmount: { type: Number, default: 0 },
    refundStatus: { 
      type: String, 
      enum: ['none', 'pending', 'processed', 'failed'],
      default: 'none'
    }
  },
  // تسجيل الوصول والمغادرة
  checkInOut: {
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// توليد رقم حجز فريد قبل الحفظ
roomBookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    let unique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!unique && attempts < maxAttempts) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 أرقام
      const candidate = `RB${randomNum}`; // Room Booking
      const exists = await mongoose.models.RoomBooking.findOne({ bookingNumber: candidate });
      if (!exists) {
        this.bookingNumber = candidate;
        unique = true;
      }
      attempts++;
    }
    
    if (!unique) {
      return next(new Error('فشل في توليد رقم حجز فريد'));
    }
  }
  
  // تحقق من صحة التواريخ
  if (this.bookingDetails.checkOut <= this.bookingDetails.checkIn) {
    return next(new Error('تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول'));
  }
  
  // حساب عدد الليالي
  const timeDiff = this.bookingDetails.checkOut.getTime() - this.bookingDetails.checkIn.getTime();
  this.bookingDetails.nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  next();
});

// Virtual fields
roomBookingSchema.virtual('totalGuests').get(function() {
  return this.bookingDetails.adults + this.bookingDetails.children + this.bookingDetails.infants;
});

roomBookingSchema.virtual('isActive').get(function() {
  return ['pending', 'confirmed', 'checked_in'].includes(this.status);
});

roomBookingSchema.virtual('canBeCancelled').get(function() {
  const now = new Date();
  const checkInDate = new Date(this.bookingDetails.checkIn);
  const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
  
  return this.status === 'confirmed' && hoursUntilCheckIn > 24; // يمكن الإلغاء قبل 24 ساعة
});

// Indexes for better performance
roomBookingSchema.index({ bookingNumber: 1 });
roomBookingSchema.index({ hotel: 1, status: 1 });
roomBookingSchema.index({ room: 1, 'bookingDetails.checkIn': 1, 'bookingDetails.checkOut': 1 });
roomBookingSchema.index({ 'guest.email': 1 });
roomBookingSchema.index({ 'bookingDetails.checkIn': 1, 'bookingDetails.checkOut': 1 });
roomBookingSchema.index({ bookingDate: -1 });
roomBookingSchema.index({ status: 1, paymentStatus: 1 });

module.exports = mongoose.model('RoomBooking', roomBookingSchema);

