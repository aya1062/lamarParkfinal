import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from '../shared/PropertyCard';
import { api, API_ORIGIN } from '../../utils/api';
import { FALLBACK_IMAGES, handleImageError } from '../../utils/imageFallback';

const API_BASE = API_ORIGIN;

const ENV: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? ((import.meta as any).env as Record<string, string | undefined>)
    : {};

/** صورة بانر افتراضية (مسبح / إقامة) — يمكن استبدالها بـ VITE_CHALETS_HOME_BANNER_URL */
const DEFAULT_CHALETS_BANNER =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80';

const absolutize = (url: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return API_BASE + url;
  return url;
};

function heroImageFromChalet(p: any): string | null {
  const imgs = p?.images;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0];
    const src = typeof first === 'string' ? first : first?.url;
    if (src) return absolutize(src);
  }
  if (p?.image) return absolutize(p.image);
  return null;
}

function extractPropertiesList(res: { success?: boolean; data?: any }): any[] {
  const d = res?.data;
  if (!d) return [];
  if (Array.isArray(d.properties)) return d.properties;
  if (Array.isArray(d.data?.properties)) return d.data.properties;
  if (Array.isArray(d)) return d;
  return [];
}

function bannerSrcFromChalets(chalets: any[]): string | null {
  for (const p of chalets) {
    const u = heroImageFromChalet(p);
    if (u) return u;
  }
  return null;
}

const LamarParkChaletsHomeSection = () => {
  const [chalets, setChalets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const bannerScrollRef = useRef<HTMLDivElement>(null);

  const handleBannerScroll = (direction: 'left' | 'right') => {
    setBannerIdx((prev) => {
      const len = resortImages.length;
      const next = direction === 'left' ? prev - 1 : prev + 1;
      return (next + len) % len;
    });
  };

  // Scroll handler for chalet cards
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

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.getProperties({ type: 'chalet' });
        if (!alive) return;
        const raw = extractPropertiesList(res);
        const visible = raw.filter(
          (p: any) => p?.status !== 'inactive' && p?.available !== false
        );
        setChalets(visible);
      } catch {
        if (alive) setChalets([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const bannerUrl = useMemo(() => {
    const fromEnv = (ENV.VITE_CHALETS_HOME_BANNER_URL || '').trim();
    if (fromEnv) return fromEnv;
    const fromData = bannerSrcFromChalets(chalets);
    if (fromData) return fromData;
    return DEFAULT_CHALETS_BANNER;
  }, [chalets]);

  const shellClass = 'mt-6 sm:mt-10 rounded-[24px] px-4 py-6 sm:px-8 sm:py-10 md:px-10 md:py-14';

// Prepare carousel images for the resort banner
const resortImages = useMemo(() => {
  // Use images from chalets as fallback carousel images
  const imgs = chalets.map((p) => heroImageFromChalet(p)).filter(Boolean);
  // Ensure at least one image exists
  return imgs.length > 0 ? imgs : [bannerUrl];
}, [chalets, bannerUrl]);

const [bannerIdx, setBannerIdx] = useState(0);

const currentBanner = resortImages[bannerIdx] || bannerUrl;

// Trigger fade animation on banner index change – handled via key prop on <img>
// No additional state needed.

  // Auto‑rotate banner images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % resortImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [resortImages]);

  if (loading) {
    return (
      <div className={shellClass} dir="rtl">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <div className="h-9 w-56 bg-gray-200 rounded-md mx-auto mb-3 animate-pulse" />
          <div className="h-6 w-48 bg-gray-100 rounded-md mx-auto animate-pulse" />
        </div>
        <div className="mb-10 overflow-hidden rounded-[20px] border border-gray-100">
          <div className="h-[220px] sm:h-[280px] md:h-[360px] w-full bg-gray-200 animate-pulse" />
        </div>
        <div className="text-center text-gray-500 text-sm">جاري تحميل الشاليهات...</div>
      </div>
    );
  }

  return (
    <div className={shellClass} dir="rtl">
      {/* عناوين مثل المرجع: عنوان + خط تحته + سطر فرعي */}
      <header className="text-right md:text-center mb-4 md:mb-10">
        <h3 className="text-xl sm:text-2xl md:text-[1.75rem] font-bold text-gray-900 tracking-tight">
          <span className="inline-block border-b-[3px] border-[#DfB86c] pb-2 px-1">منتجع لامار بارك</span>
        </h3>
        <p className="text-lg sm:text-xl font-bold text-gray-900 mt-6 md:mt-7">تجربة إقامة لا تنسي</p>
      </header>

      {/* بانر كامل العرض - عرض صور المنتجع على شكل كرousel */}
      <div className="mb-5 md:mb-12 overflow-hidden rounded-[20px] border border-gray-200/80 shadow-sm relative banner-container">

        {/* Carousel container with fade effect */}
        <img
          src={currentBanner}
          alt={`صورة المنتجع ${bannerIdx + 1}`}
          className="banner-image w-full h-[220px] sm:h-[280px] md:h-[380px] object-cover rounded-[20px]"
          key={bannerIdx}
          onError={(e) => handleImageError(e, FALLBACK_IMAGES.property)}
        />

        {/* Navigation arrows for banner */}
        {resortImages.length > 1 && (
          <>
            <button
              onClick={() => handleBannerScroll('left')}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-[#DfB86c] text-gray-800 hover:text-white backdrop-blur-sm shadow-xl items-center justify-center z-20 transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-100 hover:scale-110"
              aria-label="Banner Scroll Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleBannerScroll('right')}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-[#DfB86c] text-gray-800 hover:text-white backdrop-blur-sm shadow-xl items-center justify-center z-20 transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-100 hover:scale-110"
              aria-label="Banner Scroll Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        {/* Gradient overlay for premium look */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-[20px]" />
        {/* Centered resort title and subtitle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">منتجع لامار بارك</h2>
          <p className="text-sm md:text-base text-white opacity-90 mb-4">تجربة فاخرة لا تُنسى في قلب الطبيعة</p>
          <a href="/resort" className="inline-block bg-[#c9a55a] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#b8934e] transition-colors">استكشف المنتجع</a>
        </div>
      </div>

      {chalets.length === 0 ? (
        <p className="text-center text-gray-600 py-4 mb-2">لا توجد شاليهات للعرض حالياً.</p>
      ) : (
        <div className="relative w-full group">
          {/* Desktop Navigation Arrows */}
          {chalets.length > 3 && (
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
          {chalets.length > 2 && (
            <div className="md:hidden absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-center z-20 animate-pulse pointer-events-none border border-gray-100">
              <ArrowLeft className="w-5 h-5 text-[#c9a55a] horizontal-swipe-arrow" />
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {chalets.map((raw) => {
              const property = {
                ...raw,
                type: 'chalet' as const
              };
              return (
                <div
                  key={raw._id || raw.id}
                  className="w-[70%] md:w-[calc(33.333%-16px)] flex-shrink-0 snap-start md:snap-align-none h-full mr-4 [&_.card-luxury]:rounded-[20px] [&_.card-luxury]:shadow-md [&_.card-luxury]:border [&_.card-luxury]:border-gray-100 [&_.card-luxury>div:first-child]:rounded-t-[20px] [&_.card-luxury>div:first-child]:overflow-hidden"
                >
                  <PropertyCard property={property} ctaLabel="احجز الآن" hideTypeBadge />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-center mt-5 md:mt-12 pt-2">
        <Link
          to="/chalets"
          className="inline-block text-[20px] md:text-[22px] text-gray-900 hover:text-[#c9a55a] transition-colors"
        >
          عرض المزيد
        </Link>
      </div>
    </div>
  );
};

export default LamarParkChaletsHomeSection;
