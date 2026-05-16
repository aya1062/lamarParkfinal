const mongoose = require('mongoose');

const quickLinkSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'اسم الرابط مطلوب'] 
  },
  path: { 
    type: String, 
    required: [true, 'المسار مطلوب'] 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('QuickLink', quickLinkSchema);
