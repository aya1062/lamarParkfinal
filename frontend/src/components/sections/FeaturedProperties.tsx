import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../shared/PropertyCard';
import { api } from '../../utils/api';

const FeaturedProperties = () => {
  const [resorts, setResorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.getHotels().then((res) => {
      if (res.success && res.data && Array.isArray(res.data.hotels)) {
        // فلترة المنتجعات فقط
        const featuredResorts = res.data.hotels.filter((h: any) => 
          h.type === 'resort'
        );
        setResorts(featuredResorts);
      } else {
        setError('تعذر تحميل المنتجعات');
      }
      setLoading(false);
    });
  }, []);

  const handleViewAllResorts = () => {
    navigate('/resorts');
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            منتجعات لمار المميزة
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعة مختارة من أفضل المنتجعات في المملكة مع إطلالات خلابة وخصوصية تامة
          </p>
        </div>

        {loading ? (
          <div className="text-center text-lg">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex justify-center gap-6 pb-4 min-w-max">
              {resorts.length === 0 ? (
                <div className="text-center text-gray-500 w-full">لا توجد منتجعات للعرض</div>
              ) : (
                resorts.slice(0, 3).map((resort) => (
                  <div key={resort._id || resort.id} className="flex-shrink-0 w-80">
                    <PropertyCard property={resort} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <button 
            onClick={handleViewAllResorts}
            className="btn-gold text-lg px-8 py-4 hover:bg-gold-dark transition-colors duration-300"
          >
            عرض جميع المنتجعات
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;