const mongoose = require('mongoose');
const Property = require('../models/Property');

const MONGO_URI = 'mongodb://localhost:27017/lamarPro'; // عدّل إذا كان اسم الداتا بيز مختلف

async function markFeatured() {
  await mongoose.connect(MONGO_URI);
  const properties = await Property.find().limit(3);
  for (const prop of properties) {
    prop.featured = true;
    await prop.save();
    console.log(`تم تمييز العقار: ${prop.name}`);
  }
  await mongoose.disconnect();
  console.log('تم تحديث العقارات المميزة بنجاح.');
}

markFeatured().catch(err => {
  console.error('حدث خطأ:', err);
  mongoose.disconnect();
}); 