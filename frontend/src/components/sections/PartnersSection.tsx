import React, { useState, useEffect } from 'react';
import { partnersApi } from '../../utils/api';

interface Partner {
  _id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  category: string;
  order: number;
}

const PartnersSection: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await partnersApi.getPartners();
        if (response.success && response.data && Array.isArray(response.data)) {
          setPartners(response.data);
        } else {
          setPartners([]);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-8"></div>
              <div className="flex justify-center space-x-4 space-x-reverse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-32 h-20 bg-gray-300 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            متواجدين على
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            يمكنك العثور على منتجعات لامار بارك على أفضل منصات السفر والحجز
          </p>
        </div>

        <div className="relative">
          {/* Horizontal Scroll Container */}
          <div className="overflow-x-auto scrollbar-hide scroll-smooth">
            <div className="flex space-x-4 md:space-x space-x-reverse pb-4" style={{ width: 'max-content' }}>
              {partners && partners.length > 0 && partners.map((partner) => (
                <div
                  key={partner._id}
                  className="flex-shrink-0 w-36 md:w-48" // أصغر على الموبايل
                >
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group h-20 md:h-36 flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-contain p-4 md:p-6"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/200x120?text=' + encodeURIComponent(partner.name);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersSection;
