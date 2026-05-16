import React, { useState, useEffect, useCallback } from 'react';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';
import PropertyCard from '../shared/PropertyCard';
import { api } from '../../utils/api';

const Chalets = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    priceRange: '',
    rooms: '',
    amenities: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [chalets, setChalets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChalets = useCallback(() => {
    setLoading(true);
    
    const params: any = { type: 'chalet' };
    
    if (filters.search) params.search = filters.search;
    if (filters.location) params.location = filters.location;
    if (filters.rooms) params.rooms = filters.rooms;
    
    if (filters.priceRange) {
      if (filters.priceRange === '0-500') { params.maxPrice = 500; }
      else if (filters.priceRange === '500-800') { params.minPrice = 500; params.maxPrice = 800; }
      else if (filters.priceRange === '800-1200') { params.minPrice = 800; params.maxPrice = 1200; }
      else if (filters.priceRange === '1200+') { params.minPrice = 1200; }
    }

    api.getProperties(params).then((res) => {
      console.log("Returned data from API:", res.data);
      if (res.success && res.data && Array.isArray(res.data.properties)) {
        setChalets(res.data.properties);
      } else {
        setChalets([]);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching chalets:", err);
      setChalets([]);
      setLoading(false);
    });
  }, [filters]);

  useEffect(() => {
    fetchChalets();
  }, []); // Initial load. User must click "Apply Filters" to search again.

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
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 lg:mb-4 gap-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center self-start md:self-auto">
              <Filter className="h-5 w-5 ml-2 text-gold" />
              تصفية النتائج
            </h3>
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث باسم الشاليه أو الموقع..."
                className="input-rtl pl-4 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-gold focus:border-gold"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && fetchChalets()}
              />
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-gold px-4 py-2 text-sm self-start md:self-auto shrink-0"
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
              <button 
                onClick={fetchChalets}
                className="w-full btn-gold"
              >
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
    </div>
  );
};

export default Chalets;
