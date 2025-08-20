import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../shared/PropertyCard';
import { api } from '../../utils/api';

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.getProperties().then((res) => {
      if (res.success && res.data && Array.isArray(res.data.properties)) {
        // فلترة الشاليهات النشطة فقط
        const chaletProperties = res.data.properties.filter((p: any) => 
          p.status === 'active' && p.type === 'chalet'
        );
        setProperties(chaletProperties);
      } else {
        setError('تعذر تحميل الشاليهات');
      }
      setLoading(false);
    });
  }, []);

  const handleViewAllChalets = () => {
    navigate('/chalets');
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            شاليهات لمار المميزة
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعة مختارة من أفضل الشاليهات في المملكة مع إطلالات خلابة وخصوصية تامة
          </p>
        </div>

        {loading ? (
          <div className="text-center text-lg">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">لا توجد شاليهات مفعلة للعرض</div>
            ) : (
              properties.slice(0, 6).map((property) => (
                <PropertyCard key={property._id || property.id} property={property} />
              ))
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <button 
            onClick={handleViewAllChalets}
            className="btn-gold text-lg px-8 py-4 hover:bg-gold-dark transition-colors duration-300"
          >
            عرض جميع الشاليهات
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;