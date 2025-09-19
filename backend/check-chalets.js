const mongoose = require('mongoose');
const Property = require('./models/Property');
const Hotel = require('./models/Hotel');

async function checkChalets() {
  try {
    await mongoose.connect('mongodb://localhost:27017/lamarPark');
    console.log('Connected to MongoDB');

    // Get all chalets
    const chalets = await Property.find({type: 'chalet'});
    console.log('الشاليهات الموجودة:', chalets.length);
    
    chalets.forEach((chalet, index) => {
      console.log(`${index + 1}. ${chalet.name} - ID: ${chalet._id}`);
      console.log(`   Hotel: ${chalet.hotel || 'غير محدد'}`);
      console.log('---');
    });

    // Get all hotels/resorts
    const hotels = await Hotel.find({});
    console.log('\nالفنادق/المنتجعات الموجودة:', hotels.length);
    
    hotels.forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.name} (${hotel.type}) - ID: ${hotel._id}`);
    });

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkChalets();
