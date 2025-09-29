const mongoose = require('mongoose');
const path = require('path');

// Change to backend directory
process.chdir(path.join(__dirname, '..'));

// Load models
const Partner = require('../models/Partner');

const defaultPartners = [
  {
    name: 'المطار',
    logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
    website: 'https://almatar.com',
    description: 'منصة حجز الطيران الرائدة',
    category: 'booking',
    order: 1
  },
  {
    name: 'Tripadvisor',
    logo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200',
    website: 'https://tripadvisor.com',
    description: 'منصة مراجعات السفر العالمية',
    category: 'review',
    order: 2
  },
  {
    name: 'رحلات',
    logo: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200',
    website: 'https://rehlat.com',
    description: 'منصة السفر الشاملة',
    category: 'travel',
    order: 3
  },
  {
    name: 'المسافر',
    logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
    website: 'https://almosfer.com',
    description: 'منصة حجز الفنادق',
    category: 'booking',
    order: 4
  }
];

async function seedPartners() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lamarPark';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing partners
    await Partner.deleteMany({});
    console.log('Cleared existing partners');

    // Insert default partners
    const partners = await Partner.insertMany(defaultPartners);
    console.log(`Created ${partners.length} partners`);

    console.log('Partners seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding partners:', error);
    process.exit(1);
  }
}

seedPartners();

