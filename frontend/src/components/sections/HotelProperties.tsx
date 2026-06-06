import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import LamarParkChaletsHomeSection from './LamarParkChaletsHomeSection';
import PropertyCard from '../shared/PropertyCard';
import { api } from '../../utils/api';

/* ─── City Section ─── */
const CitySection = ({
  title,
  items,
  onViewMore,
}: {
  title: string;
  items: any[];
  onViewMore: () => void;
}) => {
  // Show max 6 to allow scrolling
  const DISPLAY_LIMIT = 6;
  const displayed = items.slice(0, DISPLAY_LIMIT);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-8 md:mb-20">
      {/* section header */}
      <header className="text-right md:text-center mb-5 md:mb-10">
        <h3 className="text-xl sm:text-2xl md:text-[1.75rem] font-bold text-gray-900 tracking-tight">
          <span className="inline-block border-b-[3px] border-[#DfB86c] pb-2 px-1">{title}</span>
        </h3>
      </header>

      {items.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">لا توجد فنادق للعرض</p>
      ) : (
        <>
          <div className="relative w-full group">
            {/* Desktop Navigation Arrows */}
            {displayed.length > 3 && (
              <>
                <button
                  onClick={() => handleScroll('left')}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-[#DfB86c] text-gray-800 hover:text-white backdrop-blur-sm shadow-xl items-center justify-center z-20 transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-100 hover:scale-110"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-[#DfB86c] text-gray-800 hover:text-white backdrop-blur-sm shadow-xl items-center justify-center z-20 transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-100 hover:scale-110"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Purely Visual Floating Swipe Helper Indicator on mobile */}
            {displayed.length > 2 && (
              <div className="md:hidden absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-center z-20 animate-pulse pointer-events-none border border-gray-100">
                <ArrowLeft className="w-5 h-5 text-[#c9a55a] horizontal-swipe-arrow" />
              </div>
            )}

            <div 
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide w-full" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayed.map((hotel) => (
                <div
                  key={hotel._id || hotel.id}
                  className="w-[55%] md:w-[calc(33.333%-16px)] flex-shrink-0 snap-start md:snap-align-none h-full mr-4"
                >
                  <PropertyCard property={hotel} hideTypeBadge />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-5 md:mt-12 pt-2">
            <button
              onClick={onViewMore}
              className="inline-block text-[20px] md:text-[22px] text-gray-900 hover:text-[#c9a55a] transition-colors"
            >
              عرض المزيد
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Main Section ─── */
const HotelProperties = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.getHotels().then((res) => {
      if (res.success && res.data?.hotels) {
        const all = Array.isArray(res.data.hotels) ? res.data.hotels : [];
        setHotels(all.filter((h: any) => h.type === 'hotel'));
      } else {
        setHotels([]);
      }
      setLoading(false);
    }).catch(() => {
      setHotels([]);
      setLoading(false);
    });
  }, []);

  const { tabukHotels, riyadhHotels, madinahHotels } = useMemo(() => {
    const norm = (h: any) =>
      String(h?.address?.city || h?.city || h?.location || '').toLowerCase().trim();
    const has = (h: any, kws: string[]) => kws.some(k => norm(h).includes(k));
    return {
      tabukHotels:   hotels.filter(h => has(h, ['تبوك', 'tabuk'])),
      riyadhHotels:  hotels.filter(h => has(h, ['الرياض', 'riyadh'])),
      madinahHotels: hotels.filter(h => has(h, ['المدينة المنورة', 'المدينة', 'madinah', 'medina'])),
    };
  }, [hotels]);

  return (
    <section className="py-8 md:py-16 bg-transparent" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {loading ? (
          /* skeleton grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 md:gap-10 lg:gap-12">
            {[...Array(3)].map((_, i) => (
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
        ) : (
          <div>
            <LamarParkChaletsHomeSection />
            <CitySection
              title="فروعنا بمدينة الرياض"
              items={riyadhHotels}
              onViewMore={() => navigate('/hotels?city=الرياض')}
            />
            <CitySection
              title="فروعنا بمدينة تبوك"
              items={tabukHotels}
              onViewMore={() => navigate('/hotels?city=تبوك')}
            />
            {madinahHotels.length > 0 && (
              <CitySection
                title="فروعنا بالمدينة المنورة"
                items={madinahHotels}
                onViewMore={() => navigate('/hotels?city=المدينة المنورة')}
              />
            )}
          </div>
        )}

        {/* <LamarParkChaletsHomeSection /> */}

        {/* view all button */}
        <div className="text-center mt-6 md:mt-16">
          <button
            onClick={() => navigate('/hotels')}
            className="inline-flex items-center gap-2 bg-[#c9a55a] hover:bg-[#b8943f] text-white font-bold px-8 py-3.5 rounded-full text-sm md:text-base transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            عرض جميع الفنادق
          </button>
        </div>
      </div>
    </section>
  );
};

export default HotelProperties;