import React from 'react';
import { Award } from 'lucide-react';
import PropertyCard from '../shared/PropertyCard';
import FloatingContact from '../common/FloatingContact';
import { api } from '../../utils/api';

const Resorts = () => {
  const [resorts, setResorts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    api.getHotels()
      .then((res) => {
        const list = res?.data?.hotels || [];
        setResorts(list.filter((h: any) => h.type === 'resort'));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">منتجعات لامار</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">استكشف أفضل المنتجعات واستمتع بتجربة إقامة فاخرة</p>
        </div>

        <div className="bg-gradient-to-r from-gold to-gold-light rounded-xl p-6 mb-8 text-white text-center">
          <div className="flex items-center justify-center mb-3">
            <Award className="h-8 w-8 ml-2" />
            <h3 className="text-2xl font-bold">عروض المنتجعات</h3>
          </div>
          <p className="text-lg opacity-90">خصومات خاصة على حجوزات المنتجعات لفترة محدودة</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">تم العثور على <span className="font-semibold text-gray-900">{resorts.length}</span> منتجع</p>
        </div>

        {loading ? (
          <div>جاري التحميل...</div>
        ) : resorts.length === 0 ? (
          <div>لا توجد منتجعات متاحة</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {resorts.map((resort) => (
              <PropertyCard key={resort._id || resort.id} property={resort} />
            ))}
          </div>
        )}

        <div className="text-center mb-12">
          <span className="text-gray-500 text-sm">نهاية القائمة</span>
        </div>
      </div>

      <FloatingContact showWhatsApp={true} showPhone={true} />
    </div>
  );
};

export default Resorts;


