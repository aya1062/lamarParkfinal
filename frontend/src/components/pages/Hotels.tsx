import React, { useState } from 'react';
import { MapPin, Filter, SlidersHorizontal, Award } from 'lucide-react';
import PropertyCard from '../shared/PropertyCard';
import FloatingContact from '../common/FloatingContact';
import { api } from '../../utils/api';

const Hotels = () => {
  const [filters, setFilters] = useState({
    location: '',
    priceRange: '',
    stars: '',
    amenities: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    setLoading(true);
    const params: any = { type: 'hotel' };
    if (filters.location) params.city = filters.location; // خريطة بسيطة للمدينة
    // يمكن لاحقاً إضافة فلترة تقييم/سعر عند دعمها في الـ API
    api.getHotels(params)
      .then((res) => {
        const list = res?.data?.hotels || [];
        setHotels(list.filter((h: any) => h.type === 'hotel'));
      })
      .catch((err) => {
        console.error('Error fetching hotels:', err);
      })
      .finally(() => setLoading(false));
  }, [filters.location]);

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            الفنادق الفاخرة
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            استمتع بإقامة مميزة في أرقى الفنادق والمنتجعات في المملكة العربية السعودية
          </p>
        </div>

        {/* Special Offers Banner */}
        <div className="bg-gradient-to-r from-gold to-gold-light rounded-xl p-6 mb-8 text-white text-center">
          <div className="flex items-center justify-center mb-3">
            <Award className="h-8 w-8 ml-2" />
            <h3 className="text-2xl font-bold">عروض حصرية</h3>
          </div>
          <p className="text-lg opacity-90">
            احصل على خصم يصل إلى 30% على حجوزات الفنادق الفاخرة لفترة محدودة
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4 lg:mb-0">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 ml-2 text-gold" />
              تصفية النتائج
            </h3>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-gold px-4 py-2 text-sm"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الموقع</label>
              <select 
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="input-rtl"
              >
                <option value="">جميع المواقع</option>
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="الدمام">الدمام</option>
                <option value="أبها">أبها</option>
                <option value="الطائف">الطائف</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نطاق السعر</label>
              <select 
                value={filters.priceRange}
                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                className="input-rtl"
              >
                <option value="">جميع الأسعار</option>
                <option value="0-700">أقل من 700 ريال</option>
                <option value="700-1000">700 - 1000 ريال</option>
                <option value="1000-1500">1000 - 1500 ريال</option>
                <option value="1500+">أكثر من 1500 ريال</option>
              </select>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تصنيف النجوم</label>
              <select 
                value={filters.stars}
                onChange={(e) => setFilters({...filters, stars: e.target.value})}
                className="input-rtl"
              >
                <option value="">جميع التصنيفات</option>
                <option value="5">5 نجوم</option>
                <option value="4">4 نجوم</option>
                <option value="3">3 نجوم</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button className="w-full btn-gold">
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            تم العثور على <span className="font-semibold text-gray-900">{hotels.length}</span> فندق
          </p>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div>جاري التحميل...</div>
        ) : hotels.length === 0 ? (
          <div>لا توجد فنادق متاحة</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {hotels.map((hotel) => (
              <PropertyCard key={hotel._id || hotel.id} property={hotel} />
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="text-center mb-12">
          <button className="btn-gold px-8 py-3">
            عرض المزيد من الفنادق
          </button>
        </div>
      </div>

      {/* Floating Contact Buttons */}
      <FloatingContact showWhatsApp={true} showPhone={true} />
    </div>
  );
};

export default Hotels;
