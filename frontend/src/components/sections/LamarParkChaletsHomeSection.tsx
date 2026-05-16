import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

  const shellClass =
    'mt-14 sm:mt-16 rounded-[24px] bg-white px-4 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.08)] border border-gray-100/90';

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
      <header className="text-right md:text-center mb-8 md:mb-10">
        <h3 className="text-2xl sm:text-3xl md:text-[1.75rem] font-bold text-gray-900 tracking-tight">
          <span className="inline-block border-b-[3px] border-gray-900 pb-2 px-1">شاليهات لامار بارك</span>
        </h3>
        <p className="text-lg sm:text-xl font-bold text-gray-900 mt-6 md:mt-7">تجربة إقامة لا تنسي</p>
      </header>

      {/* بانر كامل العرض بزوايا كبيرة — يظهر دائمًا */}
      <div className="mb-10 md:mb-12 overflow-hidden rounded-[20px] border border-gray-200/80 shadow-sm">
        <img
          src={bannerUrl}
          alt="شاليهات لامار بارك"
          className="w-full h-[220px] sm:h-[280px] md:h-[380px] object-cover"
          onError={(e) => handleImageError(e, FALLBACK_IMAGES.property)}
        />
      </div>

      {chalets.length === 0 ? (
        <p className="text-center text-gray-600 py-4 mb-2">لا توجد شاليهات للعرض حالياً.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 lg:gap-12">
          {chalets.map((raw) => {
            const property = {
              ...raw,
              type: 'chalet' as const
            };
            return (
              <div
                key={raw._id || raw.id}
                className="h-full [&_.card-luxury]:rounded-[20px] [&_.card-luxury]:shadow-md [&_.card-luxury]:border [&_.card-luxury]:border-gray-100 [&_.card-luxury>div:first-child]:rounded-t-[20px] [&_.card-luxury>div:first-child]:overflow-hidden"
              >
                <PropertyCard property={property} ctaLabel="احجز الآن" hideTypeBadge />
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center mt-10 md:mt-12 pt-2">
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
