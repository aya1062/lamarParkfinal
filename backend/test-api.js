const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// اختبار API endpoints
const testAPI = async () => {
  console.log('🚀 بدء اختبار API endpoints...\n');
  
  try {
    // اختبار جلب الفنادق
    console.log('1️⃣ اختبار جلب الفنادق...');
    const hotelsResponse = await axios.get(`${BASE_URL}/hotels`);
    console.log('✅ حالة الاستجابة:', hotelsResponse.status);
    console.log('📊 عدد الفنادق:', hotelsResponse.data.hotels?.length || 0);
    
    // اختبار جلب الغرف
    console.log('\n2️⃣ اختبار جلب الغرف...');
    const roomsResponse = await axios.get(`${BASE_URL}/rooms`);
    console.log('✅ حالة الاستجابة:', roomsResponse.status);
    console.log('📊 عدد الغرف:', roomsResponse.data.rooms?.length || 0);
    
    // اختبار جلب الحجوزات
    console.log('\n3️⃣ اختبار جلب حجوزات الغرف...');
    const bookingsResponse = await axios.get(`${BASE_URL}/room-bookings`);
    console.log('✅ حالة الاستجابة:', bookingsResponse.status);
    console.log('📊 عدد الحجوزات:', bookingsResponse.data.bookings?.length || 0);
    
    // اختبار جلب العقارات (الشاليهات)
    console.log('\n4️⃣ اختبار جلب العقارات...');
    const propertiesResponse = await axios.get(`${BASE_URL}/properties`);
    console.log('✅ حالة الاستجابة:', propertiesResponse.status);
    console.log('📊 عدد العقارات:', propertiesResponse.data.properties?.length || 0);
    
    console.log('\n🎉 تم اختبار جميع API endpoints بنجاح!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ الخادم غير متاح. تأكد من تشغيل الخادم أولاً:');
      console.log('   cd backend && npm run dev');
    } else {
      console.log('❌ خطأ في API:', error.message);
      if (error.response) {
        console.log('📊 حالة الاستجابة:', error.response.status);
        console.log('📝 رسالة الخطأ:', error.response.data);
      }
    }
  }
};

// تشغيل الاختبار
testAPI();












