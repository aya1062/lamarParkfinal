const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
  paymentDate: { type: Date, default: Date.now },
  // Additional fields
  currency: { type: String, default: 'SAR' },
  description: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('Payment', paymentSchema);
