import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../shared/PropertyCard';
import { api } from '../../utils/api';

const HotelProperties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.getProperties().then((res) => {
      if (res.success && res.data && Array.isArray(res.data.properties)) {
        // فلترة الفنادق النشطة فقط
        const hotelProperties = res.data.properties.filter((p: any) => 
          p.status === 'active' && p.type === 'hotel'
        );
        setProperties(hotelProperties);
      } else {
        setError('تعذر تحميل الفنادق');
      }
      setLoading(false);
    });
  }, []);

  const handleViewAllHotels = () => {
    navigate('/hotels');
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            فنادق لمار المميزة
          </h2>
          <div className="bg-gradient-to-r from-gold to-gold-light text-white px-6 py-3 rounded-full inline-block mb-4">
            <span className="text-xl font-bold">فندق أبل حي اليرموك</span>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            استمتع بإقامة فاخرة في أفضل فنادق المملكة مع خدمات عصرية ومرافق متطورة
            <br />
            احجز الغرفة التي تناسب احتياجاتك
          </p>
        </div>

        {loading ? (
          <div className="text-center text-lg">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">لا توجد فنادق مفعلة للعرض</div>
            ) : (
              properties.slice(0, 6).map((property) => (
                <PropertyCard key={property._id || property.id} property={property} />
              ))
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <button 
            onClick={handleViewAllHotels}
            className="btn-gold text-lg px-8 py-4 hover:bg-gold-dark transition-colors duration-300"
          >
            عرض جميع الفنادق
          </button>
        </div>
      </div>
    </section>
  );
};

export default HotelProperties; 