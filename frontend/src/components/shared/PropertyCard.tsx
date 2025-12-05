import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { API_ORIGIN } from "../../utils/api";

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

const fallbackImage = "https://picsum.photos/200/300";

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

  return (
    <div className="card-luxury overflow-hidden">
      <div className="relative w-full aspect-[5/3] overflow-hidden">
        <img
          src={getFirstImageUrl(property.images, property.image)}
          alt={property.name || "صورة العقار"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
          {property.type === "hotel" ? "فندق" : property.type === "resort" ? "منتجع" : "شاليه"}
        </div>
        {/* Rating removed as requested */}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {property.name}
        </h3>
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 ml-1 text-gold" />
          <span className="text-sm">{property.location}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
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
        <div className="flex items-center justify-between">
          <div className="text-right">
            {property.price ? (
              property.discountPrice && property.discountPrice < property.price ? (
                <>
                  <span className="line-through text-gray-400 text-lg mr-2">{property.price.toLocaleString("ar-SA")}</span>
                  <span className="text-2xl font-bold text-green-700">{property.discountPrice.toLocaleString("ar-SA")}</span>
                  <span className="text-gray-600 mr-1">ريال / ليلة</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-gray-900">{property.price.toLocaleString("ar-SA")}</span>
                  <span className="text-gray-600 mr-1">ريال / ليلة</span>
                </>
              )
            ) : null}
          </div>
          <Link
            to={targetUrl}
            className="bg-gold hover:bg-gold-light text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-300"
          >
            {property.type === 'hotel' || property.type === 'resort' ? 'احجز الآن' : 'عرض التفاصيل'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
