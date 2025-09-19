const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
require('dotenv').config();

const sampleHotels = [
  {
    name: 'فندق لامار بارك الرئيسي',
    type: 'hotel',
    location: 'الرياض، المملكة العربية السعودية',
    address: {
      street: 'شارع الملك فهد',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      zipCode: '12345'
    },
    description: 'فندق فاخر يقع في قلب الرياض، يوفر تجربة إقامة متميزة مع جميع الخدمات والمرافق الحديثة.',
    shortDescription: 'فندق فاخر في قلب الرياض',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        alt: 'فندق لامار بارك الرئيسي',
        isMain: true
      }
    ],
    rating: 4.8,
    reviewCount: 150,
    status: 'active',
    isFeatured: true,
    contact: {
      phone: '+966501234567',
      email: 'info@lamarpark.com'
    },
    stats: {
      totalRooms: 50,
      totalChalets: 20,
      occupancyRate: 85
    },
    features: ['واي فاي مجاني', 'موقف سيارات', 'مطعم', 'صالة رياضية'],
    amenities: [
      {
        title: 'واي فاي مجاني',
        body: 'إنترنت عالي السرعة في جميع أنحاء الفندق',
        icon: 'wifi',
        category: 'general'
      },
      {
        title: 'موقف سيارات',
        body: 'موقف سيارات مجاني ومؤمن',
        icon: 'car',
        category: 'transportation'
      }
    ],
    policies: {
      checkIn: '15:00',
      checkOut: '12:00',
      cancellation: 'إلغاء مجاني حتى 24 ساعة قبل الوصول',
      pets: false,
      smoking: false,
      children: 'الأطفال من جميع الأعمار مرحب بهم'
    }
  },
  {
    name: 'منتجع لامار بارك الساحلي',
    type: 'resort',
    location: 'جدة، المملكة العربية السعودية',
    address: {
      street: 'كورنيش جدة',
      city: 'جدة',
      country: 'المملكة العربية السعودية',
      zipCode: '21499'
    },
    description: 'منتجع ساحلي فاخر على شاطئ البحر الأحمر، يوفر إطلالات خلابة وخدمات متميزة.',
    shortDescription: 'منتجع ساحلي فاخر على البحر الأحمر',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        alt: 'منتجع لامار بارك الساحلي',
        isMain: true
      }
    ],
    rating: 4.9,
    reviewCount: 200,
    status: 'active',
    isFeatured: true,
    contact: {
      phone: '+966501234568',
      email: 'jeddah@lamarpark.com'
    },
    stats: {
      totalRooms: 80,
      totalChalets: 30,
      occupancyRate: 92
    },
    features: ['شاطئ خاص', 'مسبح', 'سبا', 'مطاعم متعددة'],
    amenities: [
      {
        title: 'شاطئ خاص',
        body: 'شاطئ خاص نظيف ومجهز بجميع الخدمات',
        icon: 'beach',
        category: 'recreation'
      },
      {
        title: 'مسبح',
        body: 'مسبح خارجي مع إطلالة على البحر',
        icon: 'pool',
        category: 'recreation'
      }
    ],
    policies: {
      checkIn: '14:00',
      checkOut: '11:00',
      cancellation: 'إلغاء مجاني حتى 48 ساعة قبل الوصول',
      pets: true,
      smoking: false,
      children: 'الأطفال من جميع الأعمار مرحب بهم'
    }
  },
  {
    name: 'فندق لامار بارك الجبلي',
    type: 'hotel',
    location: 'أبها، المملكة العربية السعودية',
    address: {
      street: 'منطقة عسير',
      city: 'أبها',
      country: 'المملكة العربية السعودية',
      zipCode: '61411'
    },
    description: 'فندق جبلي متميز في منطقة عسير، يوفر مناخاً معتدلاً وإطلالات خلابة على الجبال.',
    shortDescription: 'فندق جبلي في منطقة عسير',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        alt: 'فندق لامار بارك الجبلي',
        isMain: true
      }
    ],
    rating: 4.7,
    reviewCount: 120,
    status: 'active',
    isFeatured: false,
    contact: {
      phone: '+966501234569',
      email: 'abha@lamarpark.com'
    },
    stats: {
      totalRooms: 35,
      totalChalets: 15,
      occupancyRate: 78
    },
    features: ['إطلالة جبلية', 'حديقة', 'مطعم تراثي', 'نشاطات خارجية'],
    amenities: [
      {
        title: 'إطلالة جبلية',
        body: 'إطلالة خلابة على جبال عسير',
        icon: 'mountain',
        category: 'general'
      },
      {
        title: 'حديقة',
        body: 'حديقة واسعة مع نباتات محلية',
        icon: 'garden',
        category: 'recreation'
      }
    ],
    policies: {
      checkIn: '15:00',
      checkOut: '12:00',
      cancellation: 'إلغاء مجاني حتى 24 ساعة قبل الوصول',
      pets: false,
      smoking: false,
      children: 'الأطفال من جميع الأعمار مرحب بهم'
    }
  }
];

async function seedHotels() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lamarPark');
    console.log('تم الاتصال بقاعدة البيانات');

    // حذف الفنادق الموجودة
    await Hotel.deleteMany({});
    console.log('تم حذف الفنادق الموجودة');

    // إضافة الفنادق الجديدة
    const hotels = await Hotel.insertMany(sampleHotels);
    console.log(`تم إضافة ${hotels.length} فندق بنجاح`);

    // إغلاق الاتصال
    await mongoose.connection.close();
    console.log('تم إغلاق الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error('خطأ في إضافة البيانات:', error);
    process.exit(1);
  }
}

seedHotels();

