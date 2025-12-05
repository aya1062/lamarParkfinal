/* ARCHIVED: moved from scripts/createLamarParkResort.js on 2025-11-25 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

process.chdir(path.join(__dirname, '..', '..'));
const Hotel = require('../models/Hotel');

const lamarParkResort = { /* original object omitted for brevity (unchanged) */ };

async function createLamarParkResort() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lamar';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    const existingResort = await Hotel.findOne({ name: { $regex: /(لامار\s*بارك|Lamar\s*Park)/i } });
    if (existingResort) {
      console.log('منتجع لامار بارك موجود بالفعل:', existingResort._id);
      const updatedResort = await Hotel.findByIdAndUpdate(existingResort._id, { ...lamarParkResort, _id: existingResort._id }, { new: true });
      console.log('تم تحديث منتجع لامار بارك:', updatedResort._id);
    } else {
      const newResort = new Hotel(lamarParkResort);
      const savedResort = await newResort.save();
      console.log('تم إنشاء منتجع لامار بارك:', savedResort._id);
    }
    console.log('تم الانتهاء بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('خطأ في إنشاء منتجع لامار بارك:', error);
    process.exit(1);
  }
}

if (require.main === module) createLamarParkResort();
