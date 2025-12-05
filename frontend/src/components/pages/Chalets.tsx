import React, { useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '../shared/PropertyCard';
import FloatingContact from '../common/FloatingContact';
import { api } from '../../utils/api';

const Chalets = () => {
  const [filters, setFilters] = useState({
    location: '',
    priceRange: '',
    rooms: '',
    amenities: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [chalets, setChalets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    setLoading(true);
    api.getProperties({ type: 'chalet' }).then((res) => {
      console.log("Returned data from API:", res.data);
      if (res.success && res.data && Array.isArray(res.data.properties)) {
        setChalets(res.data.properties);
      } else {
        setChalets([]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            الشاليهات الفاخرة
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعة مميزة من الشاليهات الفاخرة في أجمل المواقع الطبيعية
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
                <option value="أبها">أبها</option>
                <option value="الطائف">الطائف</option>
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="العلا">العلا</option>
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
                <option value="0-500">أقل من 500 ريال</option>
                <option value="500-800">500 - 800 ريال</option>
                <option value="800-1200">800 - 1200 ريال</option>
                <option value="1200+">أكثر من 1200 ريال</option>
              </select>
            </div>

            {/* Rooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">عدد الغرف</label>
              <select 
                value={filters.rooms}
                onChange={(e) => setFilters({...filters, rooms: e.target.value})}
                className="input-rtl"
              >
                <option value="">أي عدد</option>
                <option value="1">غرفة واحدة</option>
                <option value="2">غرفتان</option>
                <option value="3">3 غرف</option>
                <option value="4+">4 غرف أو أكثر</option>
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
            تم العثور على <span className="font-semibold text-gray-900">{chalets.length}</span> شاليه
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            <div>جاري التحميل...</div>
          ) : chalets.length === 0 ? (
            <div>لا توجد شاليهات متاحة</div>
          ) : (
            chalets
              .filter(
                (chalet) =>
                  chalet &&
                  typeof chalet === "object" &&
                  chalet.name &&
                  typeof chalet.price !== "undefined"
              )
              .map((chalet) => (
                <PropertyCard key={chalet._id || chalet.id} property={chalet} />
              ))
          )}
        </div>

        {/* Load More */}
        <div className="text-center mb-12">
          <button className="btn-gold px-8 py-3">
            عرض المزيد من الشاليهات
          </button>
        </div>
      </div>

      {/* Floating Contact Buttons */}
      <FloatingContact showWhatsApp={true} showPhone={true} />
    </div>
  );
};

export default Chalets;
