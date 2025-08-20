import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

interface Property {
  id?: string;
  _id?: string;
  name: string;
  type: "hotel" | "chalet";
  location: string;
  price: number;
  rating: number;
  image?: string;
  images?: string[];
  features: string[];
  discountPrice?: number;
}

interface PropertyCardProps {
  property: Property;
}

const fallbackImage = "https://picsum.photos/200/300";

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  if (!property) return null;
  return (
    <div className="card-luxury overflow-hidden">
      <div className="relative">
        <img
          src={Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : (property.image || fallbackImage)}
          alt={property.name || "صورة العقار"}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
          {property.type === "hotel" ? "فندق" : "شاليه"}
        </div>
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg">
          <div className="flex items-center space-x-1 space-x-reverse">
            <Star className="h-4 w-4 text-gold fill-current" />
            <span className="text-sm font-medium">{property.rating}</span>
          </div>
        </div>
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
            {property.discountPrice && property.discountPrice < property.price ? (
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
            )}
          </div>
          <Link
            to={`/property/${property._id || property.id}`}
            className="bg-gold hover:bg-gold-light text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-300"
          >
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
