const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  general: {
    siteName: { type: String, default: '' },
    siteDescription: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    currency: { type: String, default: 'SAR' },
    language: { type: String, default: 'ar' }
  },
  booking: {
    cancellationHours: { type: Number, default: 24 },
    maxAdvanceBookingDays: { type: Number, default: 365 },
    minBookingDays: { type: Number, default: 1 },
    autoConfirmBookings: { type: Boolean, default: false },
    requirePaymentUpfront: { type: Boolean, default: false }
  },
  payment: {
    enableCreditCard: { type: Boolean, default: true },
    enableCashOnArrival: { type: Boolean, default: true },
    enableBankTransfer: { type: Boolean, default: false },
    taxRate: { type: Number, default: 15 },
    processingFee: { type: Number, default: 0 }
  },
  notifications: {
    emailBookingConfirmation: { type: Boolean, default: true },
    emailBookingReminder: { type: Boolean, default: true },
    emailCancellation: { type: Boolean, default: true },
    smsBookingConfirmation: { type: Boolean, default: false },
    smsBookingReminder: { type: Boolean, default: false },
    adminEmailNotifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema); 