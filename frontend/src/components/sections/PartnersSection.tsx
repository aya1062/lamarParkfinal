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
        if (response.success) {
          setPartners(response.data);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
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

  if (partners.length === 0) {
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
            <div className="flex space-x-6 space-x-reverse pb-4" style={{ width: 'max-content' }}>
              {partners.map((partner) => (
                <div
                  key={partner._id}
                  className="flex-shrink-0 w-64" // عرض مناسب للـ 4 كاردات
                >
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                    <div className="p-8 flex items-center justify-center h-40">
                      <div className="w-32 h-32 flex items-center justify-center">
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/128x128?text=' + encodeURIComponent(partner.name);
                          }}
                        />
                      </div>
                    </div>
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
