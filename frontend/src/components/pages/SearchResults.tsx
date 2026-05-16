import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../shared/PropertyCard';
import { api } from '../../utils/api';
import { Building2, Home as HomeIcon } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [hotels, setHotels] = useState<any[]>([]);
  const [chalets, setChalets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Fetch hotels and chalets matching the query
    Promise.all([
      api.getHotels({ search: query }),
      api.getProperties({ search: query, type: 'chalet' })
    ]).then(([hotelsRes, chaletsRes]) => {
      if (hotelsRes.success && hotelsRes.data?.hotels) {
        setHotels(hotelsRes.data.hotels);
      } else {
        setHotels([]);
      }

      if (chaletsRes.success && chaletsRes.data?.properties) {
        setChalets(chaletsRes.data.properties);
      } else {
        setChalets([]);
      }
    }).catch(err => {
      console.error("Search error:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            نتائج البحث عن "{query}"
          </h1>
          <p className="text-xl text-gray-600">
            تم العثور على <span className="font-bold">{hotels.length}</span> فندق و <span className="font-bold">{chalets.length}</span> شاليه
          </p>
        </div>

        {loading ? (
          <div className="text-center text-xl text-gray-600 py-12">جاري البحث...</div>
        ) : (
          <div className="space-y-16">
            
            {/* Hotels Section */}
            {hotels.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6 border-b pb-3 border-gray-200">
                  <Building2 className="h-8 w-8 text-gold" />
                  <h2 className="text-2xl font-bold text-gray-900">الفنادق</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {hotels.map(hotel => (
                    <PropertyCard key={hotel._id || hotel.id} property={hotel} />
                  ))}
                </div>
              </div>
            )}

            {/* Chalets Section */}
            {chalets.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6 border-b pb-3 border-gray-200">
                  <HomeIcon className="h-8 w-8 text-gold" />
                  <h2 className="text-2xl font-bold text-gray-900">الشاليهات</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {chalets.map(chalet => (
                    <PropertyCard key={chalet._id || chalet.id} property={chalet} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && hotels.length === 0 && chalets.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-2xl text-gray-600 mb-4">لم نتمكن من العثور على نتائج مطابقة لبحثك</p>
                <p className="text-gray-500">جرب البحث بكلمات أخرى أو تصفح الوجهات المتاحة</p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
