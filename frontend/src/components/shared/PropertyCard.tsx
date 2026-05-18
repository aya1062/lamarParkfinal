import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, CheckCircle2, ChevronRight } from "lucide-react";
import { API_ORIGIN } from "../../utils/api";
import { FALLBACK_IMAGES, handleImageError } from "../../utils/imageFallback";

type InstallmentLogo = { url?: string; alt?: string } | string;

interface Property {
  id?: string;
  _id?: string;
  name: string;
  type: "hotel" | "chalet" | "resort" | "room";
  location: string;
  price?: number;
  rating?: number;
  image?: string;
  images?: string[] | Array<{url: string, alt: string, isMain: boolean}>;
  features?: string[];
  discountPrice?: number;
  description?: string;
  shortDescription?: string;
  installmentAvailable?: boolean;
  installmentLogos?: InstallmentLogo[];
}

interface PropertyCardProps {
  property: Property;
  /** When set, overrides the default CTA label for this card */
  ctaLabel?: string;
  /** Hide the gold type pill on the image (e.g. home chalets grid) */
  hideTypeBadge?: boolean;
}

const fallbackImage = FALLBACK_IMAGES.property;

const API_BASE = API_ORIGIN;
const absolutize = (url: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return API_BASE + url;
  return url;
};

const getFirstImageUrl = (images: Property["images"], fallback?: string) => {
  if (!images || !Array.isArray(images) || images.length === 0) return fallback || fallbackImage;
  const first: any = images[0];
  const src = typeof first === 'string' ? first : (first?.url || fallback || fallbackImage);
  return absolutize(src);
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  ctaLabel: ctaLabelProp,
  hideTypeBadge
}) => {
  if (!property) return null;
  const targetUrl =
    property.type === 'hotel'
      ? `/hotel/${property._id || property.id}`
      : property.type === 'resort'
      ? `/resort/${property._id || property.id}`
      : `/property/${property._id || property.id}`;

  const installmentLogos = useMemo(() => {
    const raw = property.installmentLogos || [];
    return raw
      .map((x) => (typeof x === 'string' ? { url: x, alt: '' } : { url: x?.url, alt: x?.alt || '' }))
      .filter((x) => x.url && String(x.url).trim() !== '');
  }, [property.installmentLogos]);

  const showInstallmentLine = !!property.installmentAvailable;

  const images = useMemo(() => {
    const list: any[] = Array.isArray(property.images)
      ? property.images
      : property.image
      ? [property.image]
      : [];
    return list
      .map((img: any) =>
        typeof img === 'string' ? absolutize(img) : absolutize(img?.url)
      )
      .filter(Boolean);
  }, [property.images, property.image]);

  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [images.length, hasMultiple]);

  const currentImage = images.length > 0
    ? images[Math.min(activeIndex, images.length - 1)]
    : getFirstImageUrl(property.images, property.image);

  const typeLabel =
    property.type === "hotel" ? "فندق" : property.type === "resort" ? "منتجع" : property.type === "room" ? "غرفة" : "شاليه";

  const ctaLabel =
    ctaLabelProp ??
    (property.type === 'hotel' || property.type === 'resort' ? 'احجز الآن' : 'عرض التفاصيل');

  return (
    <div className="luxury-sheen-border-card">
      {/* Moving border overlay background */}
      <div className="sheen-animation-bg" />

      {/* The inner premium card */}
      <div className="luxury-sheen-inner-card p-3 sm:p-4">
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-[24px] sm:rounded-[28px]">
          <img
            src={currentImage}
            alt={property.name || "صورة العقار"}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError}
          />
          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`الصورة رقم ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
          {!hideTypeBadge && (
            <div className="absolute top-4 right-4 bg-[#c9a55a] text-white px-3.5 py-1 rounded-full text-sm font-semibold shadow-md">
              {typeLabel}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between w-full pt-4 px-1 pb-1 gap-4" dir="rtl">
          {/* Top Row: Title/Location on Right, Price/Text on Left */}
          <div className="flex justify-between items-start gap-2 w-full">
            {/* Right side: Title & Location */}
            <div className="flex flex-col items-start gap-1">
              <h3 className="font-bold text-[#c9a55a] text-[22px] md:text-[24px] leading-tight tracking-tight">
                {property.name}
              </h3>
              <div className="flex items-center text-[#b89650] text-[13px] md:text-sm font-medium mt-1">
                <MapPin className="h-[18px] w-[18px] ml-1 text-red-600 flex-shrink-0" />
                <span>{property.location}</span>
              </div>
            </div>

            {/* Left side: Price & Installment Text */}
            <div className="flex flex-col items-start gap-1.5 shrink-0">
              {property.price != null && property.price > 0 ? (
                property.discountPrice && property.discountPrice < property.price ? (
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="line-through text-gray-400 text-sm font-medium ml-8">{property.price.toLocaleString("en-US")}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[26px] md:text-[30px] font-extrabold text-black leading-none tracking-tighter">
                        {property.discountPrice.toLocaleString("en-US")}
                      </span>
                      <span className="text-[14px] font-bold text-black">ريال</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[26px] md:text-[30px] font-extrabold text-black leading-none tracking-tighter">
                      {property.price.toLocaleString("en-US")}
                    </span>
                    <span className="text-[14px] font-bold text-black">ريال</span>
                  </div>
                )
              ) : null}
              
              {showInstallmentLine && (
                <div className="flex items-center gap-1.5 text-black font-bold text-[14px] md:text-[15px] tracking-tight mt-1 whitespace-nowrap">
                  <CheckCircle2 className="h-[18px] w-[18px] text-[#4ecb71] fill-[#4ecb71] text-white flex-shrink-0" aria-hidden />
                  <span>متاح بالتقسيط</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Button on Right, Logos on Left */}
          <div className="flex flex-wrap justify-between items-center gap-2 w-full mt-auto pt-2 overflow-hidden">
            {/* Right side: Button */}
            <div className="shrink-0">
              <Link
                to={targetUrl}
                dir="ltr"
                className="inline-flex items-center gap-2.5 rounded-[30px] border-[2.5px] border-black bg-white py-1 pr-4 pl-1 text-[14px] md:text-[15px] font-bold text-black hover:bg-gray-50 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white flex-shrink-0">
                  <ChevronRight className="h-5 w-5 ml-0.5" aria-hidden />
                </span>
                <span className="tracking-wide uppercase pt-0.5 whitespace-nowrap">
                  {ctaLabel === 'احجز الآن' ? 'BOOK NOW' : ctaLabel}
                </span>
              </Link>
            </div>

            {/* Left side: Installment Logos */}
            {showInstallmentLine && installmentLogos.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end max-w-[48%] overflow-hidden">
                {installmentLogos.map((logo, idx) => (
                  <img
                    key={`${logo.url}-${idx}`}
                    src={absolutize(logo.url!)}
                    alt={logo.alt || 'تقسيط'}
                    className="h-5 md:h-6 w-auto object-contain"
                    style={{ maxWidth: '60px' }}
                    loading="lazy"
                    onError={handleImageError}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
