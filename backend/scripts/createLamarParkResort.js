const mongoose = require('mongoose');
const path = require('path');

// Change to backend directory
process.chdir(path.join(__dirname, '..'));

// Load models
const Hotel = require('./models/Hotel');

const lamarParkResort = {
  name: 'منتجع لامار بارك',
  type: 'resort',
  location: 'الرياض، المملكة العربية السعودية',
  address: {
    street: 'شارع الملك فهد، حي الملك فهد',
    city: 'الرياض',
    country: 'المملكة العربية السعودية',
    zipCode: '12345'
  },
  description: 'منتجع لامار بارك هو وجهة فاخرة في قلب الرياض، يوفر تجربة إقامة متميزة مع جميع الخدمات والمرافق الحديثة. يتميز المنتجع بموقعه المتميز وتصميمه العصري الذي يجمع بين الفخامة والراحة.',
  shortDescription: 'منتجع فاخر في قلب الرياض مع خدمات متميزة',
  images: [
    {
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
      alt: 'منتجع لامار بارك الرئيسي',
      isMain: true
    },
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
      alt: 'منتجع لامار بارك - المسبح',
      isMain: false
    },
    {
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
      alt: 'منتجع لامار بارك - الغرف',
      isMain: false
    }
  ],
  rating: 4.8,
  reviewCount: 150,
  status: 'active',
  isFeatured: true,
  contact: {
    phone: '+966501234567',
    email: 'info@lamarpark.sa',
    whatsapp: '+966501234567'
  },
  stats: {
    totalRooms: 50,
    totalChalets: 20,
    occupancyRate: 85,
    averageRating: 4.8
  },
  features: [
    'واي فاي مجاني',
    'موقف سيارات مجاني',
    'مطعم فاخر',
    'صالة رياضية',
    'مسبح خارجي',
    'خدمة الغرف 24/7',
    'نادي صحي',
    'منطقة أطفال'
  ],
  amenities: [
    {
      title: 'واي فاي مجاني',
      body: 'إنترنت عالي السرعة في جميع أنحاء المنتجع',
      icon: '📶',
      category: 'general'
    },
    {
      title: 'موقف سيارات',
      body: 'موقف سيارات مجاني ومؤمن لجميع الضيوف',
      icon: '🚗',
      category: 'transportation'
    },
    {
      title: 'مطعم فاخر',
      body: 'مطعم يقدم أشهى الأطباق المحلية والعالمية',
      icon: '🍽️',
      category: 'dining'
    },
    {
      title: 'صالة رياضية',
      body: 'صالة رياضية مجهزة بأحدث الأجهزة',
      icon: '💪',
      category: 'recreation'
    },
    {
      title: 'مسبح خارجي',
      body: 'مسبح خارجي مع إطلالة خلابة',
      icon: '🏊‍♂️',
      category: 'recreation'
    },
    {
      title: 'خدمة الغرف',
      body: 'خدمة الغرف متاحة على مدار الساعة',
      icon: '🛎️',
      category: 'general'
    },
    {
      title: 'نادي صحي',
      body: 'نادي صحي مع خدمات التدليك والسبا',
      icon: '🧘‍♀️',
      category: 'recreation'
    },
    {
      title: 'منطقة أطفال',
      body: 'منطقة أطفال آمنة ومجهزة',
      icon: '👶',
      category: 'recreation'
    }
  ],
  policies: {
    checkIn: '15:00',
    checkOut: '12:00',
    cancellation: 'إلغاء مجاني حتى 24 ساعة قبل الوصول',
    pets: true,
    smoking: false,
    children: 'الأطفال من جميع الأعمار مرحب بهم'
  },
  bookingSettings: {
    minStay: 1,
    maxStay: 30,
    advanceBooking: 365,
    sameDayBooking: true
  }
};

async function createLamarParkResort() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lamarPark';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if Lamar Park resort already exists
    const existingResort = await Hotel.findOne({ 
      name: { $regex: /(لامار\s*بارك|Lamar\s*Park)/i } 
    });

    if (existingResort) {
      console.log('منتجع لامار بارك موجود بالفعل:', existingResort._id);
      
      // Update existing resort with new data
      const updatedResort = await Hotel.findByIdAndUpdate(
        existingResort._id,
        { ...lamarParkResort, _id: existingResort._id },
        { new: true }
      );
      console.log('تم تحديث منتجع لامار بارك:', updatedResort._id);
    } else {
      // Create new resort
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

createLamarParkResort();

