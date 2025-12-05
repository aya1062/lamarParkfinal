/* ARCHIVED: This script was moved from scripts/assignChaletsToLamarPark.js on 2025-11-25 */
/* Original content preserved below */
/*
  Safe linker for chalets → Lamar Park hotel/resort
  Usage examples:
    node scripts/assignChaletsToLamarPark.js --dry-run            # default; shows what would change
    node scripts/assignChaletsToLamarPark.js --apply              # performs updates
    node scripts/assignChaletsToLamarPark.js --apply --force      # allow outside development

  Notes:
  - Matches hotel/resort by name /(لمار\s*بارك|Lamar\s*Park)/i
  - Only updates properties with type 'chalet' not already linked to that hotel
*/

/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');
const path = require('path');

// Parse args
const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const isForce = args.includes('--force');
const isDryRun = !isApply;

async function main() {
  const env = process.env.NODE_ENV || 'development';
  if (env !== 'development' && !isForce) {
    console.error(`Refusing to run in NODE_ENV=${env} without --force`);
    process.exit(2);
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lamarPark';

  // Load models lazily after setting cwd
  const Property = require(path.join('..', '..', 'models', 'Property'));
  const Hotel = require(path.join('..', '..', 'models', 'Hotel'));

  try {
    await mongoose.connect(mongoUri, { autoIndex: false });
    console.log(`Connected to MongoDB: ${mongoUri}`);

    const lamarPark = await Hotel.findOne({ name: { $regex: /(لمار\s*بارك|Lamar\s*Park)/i } });
    if (!lamarPark) {
      console.error('لم يتم العثور على فندق/منتجع باسم "لمار بارك" أو "Lamar Park". أوقفت العملية.');
      const suggestions = await Hotel.find({}, { name: 1, type: 1 }).limit(10);
      console.log('أقرب نتائج موجودة:', suggestions);
      process.exit(1);
    }

    console.log('الهدف:', { id: lamarPark._id.toString(), name: lamarPark.name, type: lamarPark.type });

    const query = { type: 'chalet', $or: [ { hotel: { $exists: false } }, { hotel: null }, { hotel: { $ne: lamarPark._id } } ] };
    const candidates = await Property.find(query, { _id: 1, name: 1, hotel: 1 }).limit(5000);
    console.log('عدد الشاليهات المرشحة للتحديث:', candidates.length);

    if (candidates.length === 0) {
      console.log('لا توجد شاليهات بحاجة لتحديث.');
      process.exit(0);
    }

    // Show preview
    console.table(candidates.slice(0, 20).map(c => ({ id: c._id.toString(), name: c.name, hotel: c.hotel || null })));
    if (candidates.length > 20) console.log(`... والمزيد (${candidates.length - 20})`);

    if (isDryRun) {
      console.log('\n[DRY-RUN] لم يتم إجراء أي تغييرات. استخدم --apply للتنفيذ.');
      process.exit(0);
    }

    const result = await Property.updateMany(query, { $set: { hotel: lamarPark._id } });
    console.log('تم التحديث:', result);

    const remaining = await Property.countDocuments(query);
    console.log('المتبقي بدون ربط:', remaining);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    try { await mongoose.connection.close(); } catch {}
  }
}

if (require.main === module) {
  main();
}
