import  { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../shared/PropertyCard';
import { api } from '../../utils/api';

const HotelProperties = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.getHotels().then((res) => {
      if (res.success && res.data && Array.isArray(res.data.hotels)) {
        // فلترة الفنادق فقط
        const featuredHotels = res.data.hotels.filter((h: any) => 
          h.type === 'hotel'
        );
        setHotels(featuredHotels);
      } else {
        setError('تعذر تحميل الفنادق');
      }
      setLoading(false);
    });
  }, []);

  const handleViewAllHotels = () => {
    navigate('/hotels');
  };

  // تقسيم الفنادق حسب المدينة
  const { tabukHotels, riyadhHotels } = useMemo(() => {
    const normalizeCity = (h: any) =>
      String(h?.address?.city || h?.city || h?.location || '')
        .toLowerCase()
        .trim();

    const inCity = (h: any, keywords: string[]) => {
      const city = normalizeCity(h);
      return keywords.some(k => city.includes(k));
    };

    const tabuk = hotels.filter(h => inCity(h, ['تبوك', 'tabuk']));
    const riyadh = hotels.filter(h => inCity(h, ['الرياض', 'riyadh']));
    return { tabukHotels: tabuk, riyadhHotels: riyadh };
  }, [hotels]);

  const renderCitySection = (title: string, items: any[]) => (
    <div className="mb-12">
      <div className="flex items-center justify-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 text-center">{title}</h3>
      </div>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0">
        <div className="flex gap-4 md:gap-6 pb-4 snap-x snap-mandatory justify-start md:justify-center w-max md:w-full mx-auto">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 w-full px-4">لا توجد فنادق للعرض</div>
          ) : (
            items.map((hotel) => (
              <div
                key={hotel._id || hotel.id}
                className="flex-shrink-0 w-64 sm:w-72 md:w-80 h-[380px] md:h-[420px] snap-start"
                style={{ minWidth: '16rem', maxWidth: '20rem' }}
              >
                <PropertyCard property={hotel} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            فنادق لامار المميزة
          </h2>
          {/* <div className="bg-gradient-to-r from-gold to-gold-light text-white px-6 py-3 rounded-full inline-block mb-4">
            <span className="text-xl font-bold">فندق أبل حي اليرموك</span>
          </div> */}
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
          <div className="space-y-10">
            {renderCitySection('فنادق لامار المميزة بتبوك', tabukHotels)}
            {renderCitySection('فنادق لامار المميزة بالرياض', riyadhHotels)}
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