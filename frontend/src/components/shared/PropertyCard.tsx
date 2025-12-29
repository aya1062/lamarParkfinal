import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { API_ORIGIN } from "../../utils/api";
import { FALLBACK_IMAGES, handleImageError } from "../../utils/imageFallback";

interface Property {
  id?: string;
  _id?: string;
  name: string;
  type: "hotel" | "chalet" | "resort";
  location: string;
  price?: number;
  rating?: number;
  image?: string;
  images?: string[] | Array<{url: string, alt: string, isMain: boolean}>;
  features: string[];
  discountPrice?: number;
  description?: string;
  shortDescription?: string;
}

interface PropertyCardProps {
  property: Property;
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

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  if (!property) return null;
  const targetUrl =
    property.type === 'hotel'
      ? `/hotel/${property._id || property.id}`
      : property.type === 'resort'
      ? `/resort/${property._id || property.id}`
      : `/property/${property._id || property.id}`;

  // تجهيز الصور كسلايدر تلقائي
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

  return (
    <div className="card-luxury overflow-hidden h-full flex flex-col">
      {/* تقليل ارتفاع الصورة لجعل الكارد أكثر استقامة */}
      <div className="relative w-full aspect-[16/10] overflow-hidden">
        <img
          src={currentImage}
          alt={property.name || "صورة العقار"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`الصورة رقم ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(i);
                }}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
          {property.type === "hotel" ? "فندق" : property.type === "resort" ? "منتجع" : "شاليه"}
        </div>
        {/* Rating removed as requested */}
      </div>
      {/* تقليل الهوامش الداخلية لتصغير الكارد عمودياً */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          {property.name}
        </h3>
        <div className="flex items-center text-gray-600 mb-1.5">
          <MapPin className="h-4 w-4 ml-1 text-gold" />
          <span className="text-xs sm:text-sm">{property.location}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2.5">
          {property.features && property.features.slice(0, 2).map((feature: string, index: number) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
            >
              {feature}
            </span>
          ))}
          {property.features && property.features.length > 2 && (
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
              +{property.features.length - 2} المزيد
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <div className="text-right leading-tight">
            {property.price ? (
              property.discountPrice && property.discountPrice < property.price ? (
                <>
                  <span className="line-through text-gray-400 text-base mr-2">{property.price.toLocaleString("ar-SA")}</span>
                  <span className="text-xl font-bold text-green-700">{property.discountPrice.toLocaleString("ar-SA")}</span>
                  <span className="text-gray-600 text-sm mr-1">ريال / ليلة</span>
                </>
              ) : (
                <>
                  <span className="text-xl font-bold text-gray-900">{property.price.toLocaleString("ar-SA")}</span>
                  <span className="text-gray-600 text-sm mr-1">ريال / ليلة</span>
                </>
              )
            ) : null}
          </div>
          <Link
            to={targetUrl}
            className="bg-gold hover:bg-gold-light text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm"
          >
            {property.type === 'hotel' || property.type === 'resort' ? 'احجز الآن' : 'عرض التفاصيل'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
