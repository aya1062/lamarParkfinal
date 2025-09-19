/*
  Usage: node scripts/assignChaletsToLamarPark.js
  - Finds hotel/resort with name matching /لمار بارك|Lamar Park/i
  - Assigns all chalets (properties with type 'chalet') to that hotel's _id
*/

const mongoose = require('mongoose');
const path = require('path');

// Load models
const Property = require(path.join('..', 'models', 'Property'));
const Hotel = require(path.join('..', 'models', 'Hotel'));

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lamarPark';
  try {
    await mongoose.connect(mongoUri, { autoIndex: false });
    console.log('Connected to MongoDB:', mongoUri);

    // Find Lamar Park hotel/resort
    const lamarPark = await Hotel.findOne({ name: { $regex: /(لمار\s*بارك|Lamar\s*Park)/i } });
    if (!lamarPark) {
      console.error('لم يتم العثور على فندق/منتجع باسم "لمار بارك" أو "Lamar Park". من فضلك أنشئه أولاً.');
      const suggestions = await Hotel.find({}, { name: 1, type: 1 }).limit(10);
      console.log('اقرب نتائج موجودة:', suggestions);
      process.exit(1);
    }

    console.log('سيتم ربط الشاليهات بالمنتجع:', { id: lamarPark._id.toString(), name: lamarPark.name, type: lamarPark.type });

    // Build query: all chalets not already linked to this hotel
    const query = { type: 'chalet', $or: [ { hotel: { $exists: false } }, { hotel: null }, { hotel: { $ne: lamarPark._id } } ] };
    const toUpdate = await Property.countDocuments(query);
    console.log('عدد الشاليهات المطلوب تحديثها:', toUpdate);

    if (toUpdate === 0) {
      console.log('لا توجد شاليهات بحاجة لتحديث.');
      process.exit(0);
    }

    const result = await Property.updateMany(query, { $set: { hotel: lamarPark._id } });
    console.log('تم التحديث:', result);

    // Verify
    const remaining = await Property.countDocuments(query);
    console.log('المتبقي بدون ربط:', remaining);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();


