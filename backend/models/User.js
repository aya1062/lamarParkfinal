const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  phone: { type: String, required: true },
  nationalId: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  joinDate: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
