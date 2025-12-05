import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Star, MapPin, Phone, Mail, Video, Image as ImageIcon } from 'lucide-react';
import { api } from '../../utils/api';

interface Hotel {
  _id: string;
  name: string;
  type: 'hotel' | 'resort';
  location: string;
  address: {
    city: string;
    country: string;
  };
  description: string;
  shortDescription: string;
  images: Array<any>;
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  status: 'active' | 'inactive' | 'maintenance';
  isFeatured: boolean;
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
    mapsUrl?: string;
  };
  policies?: { checkIn?: string; checkOut?: string };
  instructions: string[];
  amenities: Array<{
    title: string;
    body: string;
    icon: string;
    category: string;
  }>;
  stats: {
    totalRooms: number;
    totalChalets: number;
    occupancyRate: number;
  };
  createdAt: string;
}

const AdminHotels: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hotel' as 'hotel' | 'resort',
    location: '',
    address: {
      city: '',
      country: ''
    },
    description: '',
    shortDescription: '',
    videoUrl: '',
    contact: {
      phone: '',
      email: '',
      whatsapp: '',
      mapsUrl: ''
    },
    policies: { checkIn: '15:00', checkOut: '12:00' },
    instructions: [''],
    amenities: [{ title: '', body: '', icon: '', category: 'general' }]
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [filter, setFilter] = useState({
    type: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchHotels();
  }, [filter]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      
      const response = await fetch(`https://api.lamarparks.com/api/hotels?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        let filteredHotels = data.hotels;
        
        if (filter.search) {
          filteredHotels = filteredHotels.filter((hotel: Hotel) =>
            hotel.name.toLowerCase().includes(filter.search.toLowerCase()) ||
            hotel.location.toLowerCase().includes(filter.search.toLowerCase())
          );
        }

        // Avoid N+1: show list without per-hotel stat fetches. Stats can be fetched on details view.
        setHotels(filteredHotels);
      } else {
        setError(data.message || 'فشل في جلب الفنادق');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hotelId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفندق/المنتجع؟')) return;

    try {
      const response = await fetch(`https://api.lamarparks.com/api/hotels/${hotelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setHotels(hotels.filter(hotel => hotel._id !== hotelId));
      } else {
        alert(data.message || 'فشل في حذف الفندق');
      }
    } catch (err) {
      alert('خطأ في حذف الفندق');
    }
  };

  const handleStatusChange = async (hotelId: string, newStatus: string) => {
    try {
      const response = await fetch(`https://api.lamarparks.com/api/hotels/${hotelId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        setHotels(hotels.map(hotel => 
          hotel._id === hotelId ? { ...hotel, status: newStatus as any } : hotel
        ));
      } else {
        alert(data.message || 'فشل في تحديث حالة الفندق');
      }
    } catch (err) {
      alert('خطأ في تحديث حالة الفندق');
    }
  };

  const openEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    // Prefill form data
    setFormData({
      name: hotel.name || '',
      type: hotel.type || 'hotel',
      location: hotel.location || '',
      address: {
        city: hotel.address?.city || '',
        country: hotel.address?.country || ''
      },
      description: hotel.description || '',
      shortDescription: hotel.shortDescription || '',
      videoUrl: hotel.videoUrl || '',
      instructions: hotel.instructions || [''],
      amenities: hotel.amenities || [{ title: '', body: '', icon: '', category: 'general' }],
      policies: hotel.policies || { checkIn: '15:00', checkOut: '12:00' },
      contact: {
        phone: hotel.contact?.phone || '',
        email: hotel.contact?.email || '',
        whatsapp: (hotel as any).contact?.whatsapp || '',
        mapsUrl: (hotel as any).contact?.mapsUrl || ''
      }
    });
    // Existing images previews (support url string or object)
    const previews = (hotel.images || []).map((img: any) => img?.url ? img.url : img);
    setImagePreviews(previews.filter(Boolean));
    setSelectedImages([]);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('type', formData.type);
      fd.append('location', formData.location);
      fd.append('address', JSON.stringify(formData.address));
      fd.append('description', formData.description);
      fd.append('shortDescription', formData.shortDescription || '');
      if (formData.videoUrl) fd.append('videoUrl', formData.videoUrl);
      fd.append('instructions', JSON.stringify(formData.instructions.filter(inst => inst.trim() !== '')));
      fd.append('amenities', JSON.stringify(formData.amenities.filter(amenity => amenity.title.trim() !== '')));
      fd.append('policies', JSON.stringify({ checkIn: formData.policies.checkIn, checkOut: formData.policies.checkOut }));
      fd.append('contact', JSON.stringify({ phone: formData.contact.phone, email: formData.contact.email, whatsapp: formData.contact.whatsapp || formData.contact.phone, mapsUrl: formData.contact.mapsUrl }));
      selectedImages.forEach((file) => fd.append('images', file));

      let res;
      if (editingHotel) {
        // Preserve existing images if present
        if (imagePreviews.length > 0 && selectedImages.length === 0) {
          // Convert image previews to proper format
          const existingImages = imagePreviews.map(img => ({
            url: img,
            alt: `${formData.name} - صورة`,
            isMain: false
          }));
          fd.append('images', JSON.stringify(existingImages));
        }
        res = await fetch(`https://api.lamarparks.com/api/hotels/${editingHotel._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: fd
        });
      } else {
        res = await fetch('https://api.lamarparks.com/api/hotels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
          body: fd
      });
      }
      
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingHotel(null);
        setSelectedImages([]);
        setImagePreviews([]);
        setFormData({
          name: '',
          type: 'hotel',
          location: '',
          address: { city: '', country: '' },
          description: '',
          shortDescription: '',
          videoUrl: '',
          policies: { checkIn: '15:00', checkOut: '12:00' },
          instructions: [''],
          amenities: [{ title: '', body: '', icon: '', category: 'general' }],
          contact: { phone: '', email: '', whatsapp: '', mapsUrl: '' }
        });
        fetchHotels();
        alert(editingHotel ? 'تم تحديث الفندق/المنتجع' : 'تم إنشاء الفندق/المنتجع بنجاح');
      } else {
        alert(data.message || 'فشل في حفظ البيانات');
      }
    } catch (err) {
      alert('خطأ في حفظ البيانات');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const onImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'maintenance': return 'صيانة';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الفنادق والمنتجعات</h1>
        <button
          onClick={() => { setShowModal(true); setEditingHotel(null); setSelectedImages([]); setImagePreviews([]); setFormData({ name:'', type:'hotel', location:'', address:{city:'', country:''}, description:'', shortDescription:'', videoUrl:'', instructions:[''], amenities:[{ title: '', body: '', icon: '', category: 'general' }], contact:{phone:'', email:'', whatsapp:''}}); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة فندق/منتجع
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع العقار</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">جميع الأنواع</option>
              <option value="hotel">فندق</option>
              <option value="resort">منتجع</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="maintenance">صيانة</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="ابحث بالاسم أو الموقع..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ type: '', status: '', search: '' })}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Hotel Image */}
            <div className="relative h-48">
              <img
                src={hotel.images && hotel.images.length > 0 ? 
                  (typeof hotel.images[0] === 'string' ? hotel.images[0] : 
                   (hotel.images[0].url || 'https://via.placeholder.com/400x300?text=No+Image')) : 
                  'https://via.placeholder.com/400x300?text=No+Image'}
                alt={hotel.images && hotel.images.length > 0 && typeof hotel.images[0] === 'object' ? 
                  hotel.images[0].alt : hotel.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={400}
                  height={192}
                />
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.status)}`}>
                  {getStatusText(hotel.status)}
                </span>
              </div>

              {/* Featured Badge */}
              {hotel.isFeatured && (
                <div className="absolute top-2 left-2">
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    مميز
                  </span>
                </div>
              )}
            </div>

            {/* Hotel Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{hotel.rating}</span>
                  <span className="text-xs text-gray-500">({hotel.reviewCount})</span>
                </div>
              </div>

              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{hotel.location}</span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {hotel.shortDescription || hotel.description}
              </p>

              {/* Instructions */}
              {hotel.instructions && hotel.instructions.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">التعليمات الخاصة:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {hotel.instructions.slice(0, 2).map((instruction, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span className="line-clamp-1">{instruction}</span>
                      </li>
                    ))}
                    {hotel.instructions.length > 2 && (
                      <li className="text-blue-500 text-xs">+{hotel.instructions.length - 2} تعليمة أخرى</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">المرافق والخدمات:</h4>
                  <div className="flex flex-wrap gap-1">
                    {hotel.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {amenity.title}
                      </span>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span className="text-xs text-green-500">+{hotel.amenities.length - 3} أخرى</span>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 gap-2 mb-4 text-sm">
                {hotel.type === 'hotel' ? (
                <div className="text-center bg-blue-50 rounded-lg p-2">
                  <div className="font-semibold text-blue-600">{hotel.stats.totalRooms}</div>
                  <div className="text-blue-500">غرف</div>
                </div>
                ) : (
                <div className="text-center bg-green-50 rounded-lg p-2">
                  <div className="font-semibold text-green-600">{hotel.stats.totalChalets}</div>
                  <div className="text-green-500">شاليهات</div>
                </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-1 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{hotel.contact.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{hotel.contact.email}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(hotel)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(hotel._id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <select
                  value={hotel.status}
                  onChange={(e) => handleStatusChange(hotel._id, e.target.value)}
                  className="bg-gray-100 text-gray-700 px-2 py-2 rounded-lg text-sm"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="maintenance">صيانة</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hotels.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">لا توجد فنادق/منتجعات</div>
          <button onClick={() => setShowModal(true)} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">إضافة أول فندق/منتجع</button>
        </div>
      )}

      {/* Add/Edit Hotel Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editingHotel ? 'تعديل فندق/منتجع' : 'إضافة فندق/منتجع جديد'}</h2>
              <button onClick={() => { setShowModal(false); setEditingHotel(null); }} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفندق/المنتجع</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="أدخل الاسم"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="hotel">فندق</option>
                    <option value="resort">منتجع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="أدخل الموقع (اختياري)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="أدخل المدينة (اختياري)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البلد</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="أدخل البلد (اختياري)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف المختصر</label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="وصف مختصر"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف الكامل</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="أدخل وصف كامل (اختياري)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">التعليمات الخاصة</label>
                  <div className="space-y-2">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={instruction}
                          onChange={(e) => {
                            const newInstructions = [...formData.instructions];
                            newInstructions[index] = e.target.value;
                            setFormData({ ...formData, instructions: newInstructions });
                          }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                          placeholder={`تعليمة ${index + 1}`}
                        />
                        {formData.instructions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newInstructions = formData.instructions.filter((_, i) => i !== index);
                              setFormData({ ...formData, instructions: newInstructions });
                            }}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, instructions: [...formData.instructions, ''] });
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      إضافة تعليمة جديدة
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">المرافق والخدمات</label>
                  <div className="space-y-3">
                    {formData.amenities.map((amenity, index) => (
                      <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">اسم المرفق</label>
                            <input
                              type="text"
                              value={amenity.title || ''}
                              onChange={(e) => {
                                const newAmenities = [...formData.amenities];
                                newAmenities[index] = { ...newAmenities[index], title: e.target.value };
                                setFormData({ ...formData, amenities: newAmenities });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              placeholder="مثال: مسبح خارجي"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">التصنيف</label>
                            <select
                              value={amenity.category || 'general'}
                              onChange={(e) => {
                                const newAmenities = [...formData.amenities];
                                newAmenities[index] = { ...newAmenities[index], category: e.target.value };
                                setFormData({ ...formData, amenities: newAmenities });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="general">عامة</option>
                              <option value="room">الغرف</option>
                              <option value="dining">المطاعم والمقاهي</option>
                              <option value="recreation">الترفيه والرياضة</option>
                              <option value="business">الأعمال</option>
                              <option value="transportation">المواصلات</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">الوصف (اختياري)</label>
                            <input
                              type="text"
                              value={amenity.body || ''}
                              onChange={(e) => {
                                const newAmenities = [...formData.amenities];
                                newAmenities[index] = { ...newAmenities[index], body: e.target.value };
                                setFormData({ ...formData, amenities: newAmenities });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              placeholder="وصف مختصر للمرفق"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">الأيقونة (اختياري)</label>
                            <input
                              type="text"
                              value={amenity.icon || ''}
                              onChange={(e) => {
                                const newAmenities = [...formData.amenities];
                                newAmenities[index] = { ...newAmenities[index], icon: e.target.value };
                                setFormData({ ...formData, amenities: newAmenities });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              placeholder="مثال: 🏊‍♂️ أو 🍽️"
                            />
                          </div>
                        </div>
                        {formData.amenities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newAmenities = formData.amenities.filter((_, i) => i !== index);
                              setFormData({ ...formData, amenities: newAmenities });
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            حذف هذا المرفق
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ 
                          ...formData, 
                          amenities: [...formData.amenities, { title: '', body: '', icon: '', category: 'general' }] 
                        });
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      إضافة مرفق جديد
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Video className="w-4 h-4" /> رابط الفيديو (اختياري)</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                {/* Policies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تسجيل الوصول</label>
                  <input
                    type="text"
                    name="policies.checkIn"
                    value={(formData as any).policies?.checkIn}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="مثال: 15:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تسجيل المغادرة</label>
                  <input
                    type="text"
                    name="policies.checkOut"
                    value={(formData as any).policies?.checkOut}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="مثال: 12:00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> صور (يمكن اختيار عدة صور)</label>
                  <input type="file" accept="image/*" multiple onChange={onImagesChange} className="w-full" />
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {imagePreviews.map((src, idx) => (
                        <img key={idx} src={src} className="w-20 h-20 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف/واتساب</label>
                  <input
                    type="tel"
                    name="contact.phone"
                    value={formData.contact.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="أدخل رقم الهاتف/واتساب (اختياري)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="أدخل البريد الإلكتروني (اختياري)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط الموقع على الخريطة (Maps URL)</label>
                  <input
                    type="url"
                    name="contact.mapsUrl"
                    value={(formData as any).contact.mapsUrl}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://maps.google.com/?q=..."
                  />
                </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم واتساب (اختياري)</label>
                <input
                    type="tel"
                    name="contact.whatsapp"
                    value={formData.contact.whatsapp}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="إن تُرك فارغاً سيتم استخدام رقم الهاتف"
                />
              </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingHotel(null); }} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingHotel ? 'تحديث' : 'إضافة'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHotels;