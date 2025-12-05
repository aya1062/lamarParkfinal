// بيانات وهمية للعقارات
export const mockProperties = [
  {
    id: '1',
    name: 'فندق الريتز كارلتون الرياض',
    type: 'hotel' as const,
    location: 'الرياض',
    price: 1200,
    rating: 4.9,
    reviewCount: 324,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    features: ['واي فاي مجاني', 'مسبح', 'سبا', 'مطعم'],
    amenities: [
      'واي فاي مجاني',
      'مسبح خارجي',
      'سبا ومركز صحي',
      'مطاعم فاخرة',
      'مركز أعمال',
      'صالة رياضية',
      'خدمة الغرف 24/7',
      'موقف سيارات مجاني'
    ],
    description: 'يقع فندق الريتز كارلتون في قلب الرياض، ويوفر تجربة إقامة فاخرة لا تُنسى.',
    available: true
  },
  {
    id: '2',
    name: 'شاليه الواحة الذهبية',
    type: 'chalet' as const,
    location: 'أبها',
    price: 800,
    rating: 4.8,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    features: ['شرفة خاصة', 'مطبخ مجهز', 'مسبح خاص', 'حديقة'],
    amenities: [
      'شرفة خاصة',
      'مطبخ مجهز بالكامل',
      'مسبح خاص',
      'حديقة واسعة',
      'موقد خشبي',
      'إطلالة جبلية'
    ],
    description: 'شاليه فاخر في أبها مع إطلالة خلابة على الجبال.',
    available: true
  }
];

// بيانات وهمية للحجوزات
export const mockBookings = [
  {
    id: 'LP001',
    guest: {
      name: 'أحمد محمد العلي',
      email: 'ahmed@email.com',
      phone: '+966 50 123 4567'
    },
    property: {
      name: 'فندق الريتز كارلتون الرياض',
      type: 'hotel',
      location: 'الرياض'
    },
    dates: {
      checkIn: '2024-02-15',
      checkOut: '2024-02-17',
      nights: 2
    },
    guests: 2,
    amount: 2400,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingDate: '2024-02-10'
  }
];

// بيانات وهمية للمستخدمين
export const mockUsers = [
  {
    id: '1',
    name: 'أحمد المدير',
    email: 'admin@lamarpark.sa',
    role: 'admin' as const,
    phone: '+966 50 123 4567',
    status: 'active',
    joinDate: '2023-01-01',
    lastLogin: '2024-02-14'
  },
  {
    id: '2',
    name: 'فاطمة العميل',
    email: 'customer@example.com',
    role: 'customer' as const,
    phone: '+966 55 987 6543',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2024-02-13'
  }
];

// دالة للحصول على عقار بالمعرف
export const getPropertyById = (id: string) => {
  return mockProperties.find(property => property.id === id);
};

// دالة للحصول على العقارات حسب النوع
export const getPropertiesByType = (type: 'hotel' | 'chalet') => {
  return mockProperties.filter(property => property.type === type);
};

// دالة للبحث في العقارات
export const searchProperties = (query: string, filters?: any) => {
  let results = mockProperties;

  if (query) {
    results = results.filter(property => 
      property.name.toLowerCase().includes(query.toLowerCase()) ||
      property.location.toLowerCase().includes(query.toLowerCase())
    );
  }

  if (filters?.type) {
    results = results.filter(property => property.type === filters.type);
  }

  if (filters?.location) {
    results = results.filter(property => property.location === filters.location);
  }

  if (filters?.priceRange) {
    const [min, max] = filters.priceRange.split('-').map(Number);
    results = results.filter(property => {
      if (max) {
        return property.price >= min && property.price <= max;
      } else {
        return property.price >= min;
      }
    });
  }

  return results;
};