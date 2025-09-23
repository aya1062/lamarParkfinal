const mongoose = require('mongoose');
require('dotenv').config();

// استيراد النماذج
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');
const RoomBooking = require('./models/RoomBooking');
const Property = require('./models/Property');

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lamar');
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  } catch (err) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
    process.exit(1);
  }
};

// اختبار إنشاء فندق تجريبي
const testHotelCreation = async () => {
  try {
    console.log('\n🏨 اختبار إنشاء فندق...');
    
    // حذف الفنادق الموجودة مسبقاً
    await Hotel.deleteMany({});
    
    const testHotel = new Hotel({
      name: 'فندق لامار بارك التجريبي',
      type: 'hotel',
      location: 'الرياض، المملكة العربية السعودية',
      address: {
        street: 'شارع الملك فهد',
        city: 'الرياض',
        state: 'منطقة الرياض',
        country: 'المملكة العربية السعودية',
        zipCode: '12345'
      },
      description: 'فندق فاخر في قلب الرياض مع مرافق متكاملة',
      shortDescription: 'فندق 5 نجوم في الرياض',
      images: [{
        url: 'https://example.com/hotel1.jpg',
        alt: 'صورة الفندق الرئيسية',
        isMain: true
      }],
      rating: 4.8,
      reviewCount: 150,
      features: ['مسبح', 'جيم', 'مطعم', 'واي فاي مجاني'],
      amenities: [
        {
          title: 'مسبح خارجي',
          body: 'مسبح كبير مع إطلالة رائعة',
          category: 'recreation'
        },
        {
          title: 'جيم مجهز',
          body: 'صالة رياضية حديثة مع أحدث الأجهزة',
          category: 'recreation'
        }
      ],
      contact: {
        phone: '+966501234567',
        email: 'info@lamarpark.com',
        website: 'https://lamarpark.com'
      },
      status: 'active',
      isFeatured: true
    });

    const savedHotel = await testHotel.save();
    console.log('✅ تم إنشاء الفندق بنجاح:', savedHotel.name);
    console.log('🆔 معرف الفندق:', savedHotel._id);
    
    return savedHotel;
  } catch (error) {
    console.error('❌ خطأ في إنشاء الفندق:', error.message);
    throw error;
  }
};

// اختبار إنشاء غرفة تجريبية
const testRoomCreation = async (hotelId) => {
  try {
    console.log('\n🛏️ اختبار إنشاء غرفة...');
    
    // حذف الغرف الموجودة مسبقاً
    await Room.deleteMany({});
    
    const testRoom = new Room({
      hotel: hotelId,
      roomNumber: '101',
      name: 'غرفة ديلوكس',
      type: 'deluxe',
      description: 'غرفة فاخرة مع إطلالة على المدينة',
      images: [{
        url: 'https://example.com/room1.jpg',
        alt: 'صورة الغرفة',
        isMain: true
      }],
      specifications: {
        size: 45,
        floor: 1,
        view: 'city',
        bedType: 'king',
        maxOccupancy: 3,
        maxAdults: 2,
        maxChildren: 1
      },
      amenities: [
        {
          title: 'تلفزيون ذكي',
          body: 'تلفزيون 55 بوصة مع قنوات متنوعة'
        },
        {
          title: 'ميني بار',
          body: 'ميني بار مجهز بالمشروبات والوجبات الخفيفة'
        }
      ],
      pricing: {
        basePrice: 500,
        currency: 'SAR',
        extraPersonPrice: 100,
        extraBedPrice: 50
      },
      availability: {
        isActive: true,
        totalRooms: 5,
        availableRooms: 5
      },
      status: 'active'
    });

    const savedRoom = await testRoom.save();
    console.log('✅ تم إنشاء الغرفة بنجاح:', savedRoom.name);
    console.log('🆔 معرف الغرفة:', savedRoom._id);
    console.log('🏨 معرف الفندق:', savedRoom.hotel);
    
    return savedRoom;
  } catch (error) {
    console.error('❌ خطأ في إنشاء الغرفة:', error.message);
    throw error;
  }
};

// اختبار إنشاء حجز تجريبي
const testBookingCreation = async (hotelId, roomId) => {
  try {
    console.log('\n📅 اختبار إنشاء حجز...');
    
    // حذف الحجوزات الموجودة مسبقاً
    await RoomBooking.deleteMany({});
    
    const testBooking = new RoomBooking({
      guest: {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        nationality: 'سعودي',
        idNumber: '1234567890'
      },
      hotel: hotelId,
      room: roomId,
      bookingDetails: {
        checkIn: new Date('2024-02-01'),
        checkOut: new Date('2024-02-03'),
        nights: 2,
        adults: 2,
        children: 0,
        infants: 0,
        roomCount: 1
      },
      pricing: {
        basePrice: 1000,
        extraPersonPrice: 0,
        extraBedPrice: 0,
        totalAmount: 1000,
        currency: 'SAR'
      },
      status: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: 'غرفة في الطابق العلوي'
    });

    const savedBooking = await testBooking.save();
    console.log('✅ تم إنشاء الحجز بنجاح');
    console.log('🆔 رقم الحجز:', savedBooking.bookingNumber);
    console.log('👤 اسم الضيف:', savedBooking.guest.name);
    console.log('💰 المبلغ الإجمالي:', savedBooking.pricing.totalAmount, 'ريال');
    
    return savedBooking;
  } catch (error) {
    console.error('❌ خطأ في إنشاء الحجز:', error.message);
    throw error;
  }
};

// اختبار تحديث نموذج العقار
const testPropertyUpdate = async (hotelId) => {
  try {
    console.log('\n🏠 اختبار تحديث نموذج العقار...');
    
    // حذف العقارات الموجودة مسبقاً
    await Property.deleteMany({});
    
    const testProperty = new Property({
      name: 'شاليه لامار بارك',
      type: 'chalet',
      hotel: hotelId, // ربط الشاليه بالفندق
      location: 'منتجع لامار بارك',
      price: 800,
      discountPrice: 650,
      description: 'شاليه فاخر داخل منتجع لامار بارك',
      chaletSettings: {
        maxOccupancy: 6,
        bedrooms: 3,
        bathrooms: 2,
        size: 120,
        hasPool: true,
        hasGarden: true,
        hasKitchen: true,
        hasParking: true
      },
      status: 'active'
    });

    const savedProperty = await testProperty.save();
    console.log('✅ تم إنشاء الشاليه بنجاح:', savedProperty.name);
    console.log('🆔 معرف الشاليه:', savedProperty._id);
    console.log('🏨 معرف الفندق المرتبط:', savedProperty.hotel);
    
    return savedProperty;
  } catch (error) {
    console.error('❌ خطأ في إنشاء الشاليه:', error.message);
    throw error;
  }
};

// اختبار الاستعلامات
const testQueries = async () => {
  try {
    console.log('\n🔍 اختبار الاستعلامات...');
    
    // عدد الفنادق
    const hotelCount = await Hotel.countDocuments();
    console.log('📊 عدد الفنادق:', hotelCount);
    
    // عدد الغرف
    const roomCount = await Room.countDocuments();
    console.log('📊 عدد الغرف:', roomCount);
    
    // عدد الحجوزات
    const bookingCount = await RoomBooking.countDocuments();
    console.log('📊 عدد الحجوزات:', bookingCount);
    
    // عدد الشاليهات
    const propertyCount = await Property.countDocuments();
    console.log('📊 عدد الشاليهات:', propertyCount);
    
    // جلب فندق مع غرفه
    const hotelWithRooms = await Hotel.findById(await Hotel.findOne().select('_id')).populate('stats.totalRooms');
    console.log('🏨 فندق مع إحصائياته:', hotelWithRooms?.name);
    
    // جلب غرفة مع فندقها
    const roomWithHotel = await Room.findOne().populate('hotel', 'name type');
    console.log('🛏️ غرفة مع فندقها:', roomWithHotel?.name, 'في', roomWithHotel?.hotel?.name);
    
    // جلب حجز مع تفاصيله
    const bookingWithDetails = await RoomBooking.findOne()
      .populate('hotel', 'name')
      .populate('room', 'name roomNumber');
    console.log('📅 حجز:', bookingWithDetails?.bookingNumber, 'في', bookingWithDetails?.hotel?.name);
    
  } catch (error) {
    console.error('❌ خطأ في الاستعلامات:', error.message);
  }
};

// تشغيل جميع الاختبارات
const runTests = async () => {
  try {
    await connectDB();
    
    const hotel = await testHotelCreation();
    const room = await testRoomCreation(hotel._id);
    const booking = await testBookingCreation(hotel._id, room._id);
    const property = await testPropertyUpdate(hotel._id);
    
    await testQueries();
    
    console.log('\n🎉 تم تنفيذ جميع الاختبارات بنجاح!');
    console.log('\n📋 ملخص البيانات المُنشأة:');
    console.log('🏨 فندق:', hotel.name);
    console.log('🛏️ غرفة:', room.name, '(رقم', room.roomNumber + ')');
    console.log('📅 حجز:', booking.bookingNumber);
    console.log('🏠 شاليه:', property.name);
    
  } catch (error) {
    console.error('❌ فشل في الاختبارات:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 تم إغلاق الاتصال بقاعدة البيانات');
  }
};

// تشغيل الاختبارات
runTests();















