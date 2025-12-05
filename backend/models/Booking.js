const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guest: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dates: {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true }
  },
  guests: { type: Number, required: true, min: 1 },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['cash', 'cash_on_arrival'], default: 'cash' },
  specialRequests: { type: String },
  bookingDate: { type: Date, default: Date.now },
  bookingNumber: { type: String, unique: true }, // رقم الحجز الفريد
  payment: {
    transactionId: { type: String },
    amount: { type: Number },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentDate: { type: Date },
    paymentMethod: { type: String }
  }
});

// توليد رقم حجز فريد قبل الحفظ
bookingSchema.pre('save', async function(next) {
  // توليد رقم حجز إذا لم يوجد
  if (!this.bookingNumber) {
    let unique = false;
    while (!unique) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 أرقام
      const candidate = `LP${randomNum}`;
      const exists = await mongoose.models.Booking.findOne({ bookingNumber: candidate });
      if (!exists) {
        this.bookingNumber = candidate;
        unique = true;
      }
    }
  }
  // تحقق من التواريخ
  if (this.dates.checkOut <= this.dates.checkIn) {
    return next(new Error('تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول'));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
