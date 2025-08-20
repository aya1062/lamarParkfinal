import React, { useState } from 'react';
import { Calendar, Users, MapPin, Search } from 'lucide-react';

const Hero = () => {
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '2',
    location: 'الرياض'
  });

  const handleSearch = () => {
    console.log('Searching with:', bookingData);
  };

  return (
    <div 
      className="relative h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/hero-bg.jpg')`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            مرحباً بك في 
            <span className="text-gold block mt-2">لمار بارك</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90">
            اكتشف أفضل الفنادق والشاليهات الفاخرة في المملكة العربية السعودية
          </p>

          {/* Booking Box */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <MapPin className="h-4 w-4 ml-2 text-gold" />
                  الوجهة
                </label>
                <select 
                  value={bookingData.location}
                  onChange={(e) => setBookingData({...bookingData, location: e.target.value})}
                  className="input-rtl text-gray-700"
                >
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الدمام">الدمام</option>
                  <option value="أبها">أبها</option>
                  <option value="الطائف">الطائف</option>
                </select>
              </div>

              {/* Check-in Date */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <Calendar className="h-4 w-4 ml-2 text-gold" />
                  تاريخ الوصول
                </label>
                <input 
                  type="date"
                  value={bookingData.checkIn}
                  onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                  className="input-rtl text-gray-700"
                />
              </div>

              {/* Check-out Date */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <Calendar className="h-4 w-4 ml-2 text-gold" />
                  تاريخ المغادرة
                </label>
                <input 
                  type="date"
                  value={bookingData.checkOut}
                  onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                  className="input-rtl text-gray-700"
                />
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <Users className="h-4 w-4 ml-2 text-gold" />
                  عدد الأشخاص
                </label>
                <select 
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({...bookingData, guests: e.target.value})}
                  className="input-rtl text-gray-700"
                >
                  <option value="1">شخص واحد</option>
                  <option value="2">شخصان</option>
                  <option value="3">3 أشخاص</option>
                  <option value="4">4 أشخاص</option>
                  <option value="5">5 أشخاص</option>
                  <option value="6+">6+ أشخاص</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;