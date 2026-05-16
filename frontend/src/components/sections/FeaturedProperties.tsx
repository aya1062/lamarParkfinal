import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PropertyCard from '../shared/PropertyCard';
import { api } from '../../utils/api';

const FeaturedProperties = () => {
  const [resorts, setResorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getHotels().then((res) => {
      if (res.success && res.data && res.data.hotels) {
        const hotels = res.data.hotels;
        
        if (Array.isArray(hotels)) {
          // فلترة المنتجعات فقط
          const featuredResorts = hotels.filter((h: any) => 
            h.type === 'resort'
          );
          setResorts(featuredResorts);
        } else {
          setResorts([]);
        }
      } else {
        setResorts([]);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Error fetching resorts:', error);
      setResorts([]);
      setLoading(false);
    });
  }, []);

  const handleViewAllResorts = () => {
    navigate('/resorts');
  };

  return (
    <section className="py-12 md:py-16 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="text-right md:text-center mb-10 md:mb-12">
          <h3 className="text-2xl sm:text-3xl md:text-[1.75rem] font-bold text-gray-900 tracking-tight mb-4">
            <span className="inline-block border-b-[3px] border-gray-900 pb-2 px-1">منتجعات لامار المميزة</span>
          </h3>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعة مختارة من أفضل المنتجعات في المملكة مع إطلالات خلابة وخصوصية تامة
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 lg:gap-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-[32px] bg-white shadow-sm border border-gray-100 overflow-hidden animate-pulse h-[400px]">
                <div className="bg-gray-200 h-1/2 w-full" />
                <div className="p-4 space-y-4 mt-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded-full w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="flex md:grid md:grid-cols-2 gap-4 md:gap-10 lg:gap-12 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {resorts.length === 0 ? (
              <div className="w-full text-center text-gray-500 py-8">لا توجد منتجعات للعرض</div>
            ) : (
              resorts.map((resort) => (
                <div key={resort._id || resort.id} className="w-[calc(50%-8px)] md:w-auto flex-shrink-0 snap-start md:snap-align-none h-full">
                  <PropertyCard property={resort} hideTypeBadge />
                </div>
              ))
            )}
          </div>
        )}

        <div className="text-center mt-10 md:mt-12 pt-2">
          <button 
            onClick={handleViewAllResorts}
            className="inline-block text-[20px] md:text-[22px] text-gray-900 hover:text-[#c9a55a] transition-colors"
          >
            عرض المزيد
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;