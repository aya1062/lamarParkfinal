import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, MapPin, Star, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://api.lamarparks.com/api';

const AdminProperties = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [newProperty, setNewProperty] = useState({
    name: '',
    type: 'hotel',
    hotel: '',
    location: '',
    price: '',
    discountPrice: '',
    videoUrl: '',
    description: '',
    amenities: [{ title: '', body: '' }],
    roomSettings: {
      specifications: {
        size: 0,
        floor: 0,
        view: 'interior',
        bedType: 'double',
        maxOccupancy: 1,
        maxAdults: 1,
        maxChildren: 0
      },
      pricing: {
        basePrice: 0,
        currency: 'SAR',
        extraPersonPrice: 0,
        extraBedPrice: 0
      },
      availability: {
        isActive: true,
        totalUnits: 1,
        availableUnits: 1
      }
    }
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editProperty, setEditProperty] = useState<any>(null);
  const [editSelectedImages, setEditSelectedImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editImagesToRemove, setEditImagesToRemove] = useState<string[]>([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const navigate = useNavigate();

  // Helper: resolve hotel name from object or ID
  const getHotelName = (hotelField: any): string => {
    if (!hotelField) return '';
    if (typeof hotelField === 'object') return hotelField?.name || '';
    const found = hotels.find((h: any) => h?._id === hotelField);
    return found?.name || '';
  };

  const isSelected = (id: string) => selectedIds.includes(id);
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const selectAllCurrent = (list: any[]) => {
    setSelectedIds(list.map(p => p._id));
  };
  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`سيتم حذف ${selectedIds.length} عنصر/عناصر. هل أنت متأكد؟`)) return;
    try {
      await Promise.allSettled(selectedIds.map(id => axios.delete(`${API_URL}/properties/${id}`)));
      clearSelection();
      fetchProperties();
      alert('تم حذف العناصر المحددة');
    } catch (err: any) {
      alert('حدث خطأ أثناء الحذف الجماعي');
    }
  };

  const handleCloneProperty = async (property: any) => {
    try {
      // 1) إنشاء نسخة بدون صور عبر POST
      const basePayload: any = {
        name: `${property.name} - نسخة`,
        type: property.type,
        location: property.location || '',
        price: property.price ?? property?.roomSettings?.pricing?.basePrice ?? 0,
        discountPrice: property.discountPrice ?? '',
        videoUrl: property.videoUrl || '',
        description: property.description || '',
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
      };
      if (property.type === 'room' || property.type === 'chalet') {
        const hotelId = (property.hotel && typeof property.hotel === 'object') ? property.hotel._id : property.hotel;
        basePayload.hotel = hotelId || '';
      }
      if (property.type === 'room' && property.roomSettings) {
        basePayload.roomSettings = property.roomSettings;
      }

      const formData = new FormData();
      Object.entries(basePayload).forEach(([key, value]) => {
        if (key === 'amenities' || key === 'roomSettings') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      const createRes = await axios.post(`${API_URL}/properties`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!createRes.data?.success) {
        alert('فشل إنشاء النسخة');
        return;
      }
      const newId = createRes.data.property?._id || createRes.data.property?.id;

      // 2) نسخ الصور الحالية عبر PUT كروابط (بدون إعادة رفع)
      const imgs = Array.isArray(property.images) ? property.images : [];
      if (newId && imgs.length > 0) {
        const putData = new FormData();
        imgs.forEach((img: string) => putData.append('images', img));
        await axios.put(`${API_URL}/properties/${newId}`, putData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      fetchProperties();
      alert('تم إنشاء نسخة من العقار');
    } catch (err: any) {
      alert('حدث خطأ أثناء إنشاء النسخة');
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchHotels();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/properties`);
      const data = Array.isArray(res.data) ? res.data : (res.data.properties || []);
      setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await axios.get(`${API_URL}/hotels`);
      if (res.data?.success) setHotels(res.data.hotels || []);
    } catch (err) {
      console.error('Failed to fetch hotels', err);
    }
  };

  // دالة لتحويل رابط YouTube العادي إلى embed
  const convertToEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // إذا كان الرابط بالفعل embed، إرجاعه كما هو
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // تحويل رابط YouTube العادي إلى embed
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    
    return url; // إرجاع الرابط كما هو إذا لم يتم التعرف عليه
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      // إضافة البيانات الأساسية
      // فلترة المرافق الفارغة
      const cleanedAmenities = (newProperty.amenities || []).filter((a) => (a.title && a.title.trim()) || (a.body && a.body.trim()));

      Object.entries({
        ...newProperty,
        amenities: cleanedAmenities
      }).forEach(([key, value]) => {
        if (key === 'amenities') {
          // تحويل المرافق إلى JSON string
          formData.append(key, JSON.stringify(value));
        } else if (key === 'roomSettings') {
          // تحويل إعدادات الغرفة إلى JSON string
          formData.append(key, JSON.stringify(value));
        } else if (key === 'videoUrl') {
          // تحويل رابط الفيديو إلى embed
          formData.append(key, convertToEmbedUrl(value));
        } else if (key === 'discountPrice') {
          // اجعل الخصم اختياريًا: لا ترسل الحقل إن كان فارغًا
          if (value !== '' && value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        } else {
          formData.append(key, value);
        }
      });
      
      selectedImages.forEach((file) => {
        formData.append('images', file);
      });
      
      const response = await axios.post(`${API_URL}/properties`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (response.data.success) {
        setNewProperty({ 
          name: '', 
          type: 'hotel', 
          hotel: '', 
          location: '', 
          price: '', 
          discountPrice: '', 
          videoUrl: '', 
          description: '', 
          amenities: [{ title: '', body: '' }],
          roomSettings: {
            specifications: {
              size: 0,
              floor: 0,
              view: 'interior',
              bedType: 'double',
              maxOccupancy: 1,
              maxAdults: 1,
              maxChildren: 0
            },
            pricing: {
              basePrice: 0,
              currency: 'SAR',
              extraPersonPrice: 0,
              extraBedPrice: 0
            },
            availability: {
              isActive: true,
              totalUnits: 1,
              availableUnits: 1
            }
          }
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setShowAddModal(false);
        fetchProperties();
        alert('تم إضافة العقار بنجاح');
      } else {
        alert('فشل في إضافة العقار: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('Error adding property:', error);
      alert('فشل في إضافة العقار: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/properties/${id}`);
      if (response.data.success) {
        fetchProperties();
        alert('تم حذف العقار بنجاح');
      } else {
        alert('فشل في حذف العقار: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('Error deleting property:', error);
      alert('فشل في حذف العقار: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditClick = (property: any) => {
    // تحويل المرافق من string إلى array إذا كانت string
    let amenities = property.amenities;
    if (typeof amenities === 'string') {
      try {
        amenities = JSON.parse(amenities);
      } catch {
        // إذا فشل التحويل، تحويل إلى array بسيط
        amenities = amenities.split(',').map((item: string) => ({ title: item.trim(), body: '' }));
      }
    }
    if (!Array.isArray(amenities) || amenities.length === 0) {
      amenities = [{ title: '', body: '' }];
    }
    
    setEditProperty({ ...property, amenities });
    setEditSelectedImages([]);
    setEditImagePreviews([]);
    setEditImagesToRemove([]);
    setShowEditModal(true);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const MAX_FILE_SIZE_MB = 10;
      const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
      
      // Convert FileList to array and filter out large files
      const allFiles = Array.from(e.target.files);
      const validFiles = allFiles.filter(file => file.size <= MAX_FILE_SIZE_BYTES);
      const oversizedFiles = allFiles.filter(file => file.size > MAX_FILE_SIZE_BYTES);
      
      // Show warning if any files were too large
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(', ');
        const fileCount = oversizedFiles.length;
        alert(`تم تجاهل ${fileCount} ملف/ملفات لكون حجمها أكبر من ${MAX_FILE_SIZE_MB} ميجابايت: ${fileNames}`);
      }
      
      // Only proceed if there are valid files
      if (validFiles.length > 0) {
        setEditSelectedImages(prev => [...prev, ...validFiles]);
        
        // Create previews only for valid files
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setEditImagePreviews(prev => [...prev, ...newPreviews]);
      }
      
      // Reset the file input to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  const handleRemoveExistingImage = (imgUrl: string) => {
    setEditImagesToRemove((prev) => [...prev, imgUrl]);
    setEditProperty((prev: any) => ({
      ...prev,
      images: prev.images.filter((img: string) => img !== imgUrl),
    }));
  };

  const handleRemoveNewImage = (idx: number) => {
    const newFiles = [...editSelectedImages];
    const newPreviews = [...editImagePreviews];
    newFiles.splice(idx, 1);
    newPreviews.splice(idx, 1);
    setEditSelectedImages(newFiles);
    setEditImagePreviews(newPreviews);
  };

  // Function to check if any file exceeds the size limit
  const checkFileSizes = (files: File[]): { valid: boolean; message: string } => {
    const MAX_FILE_SIZE_MB = 10; // Maximum file size in MB
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert to bytes
    
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE_BYTES);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      const fileCount = oversizedFiles.length;
      return {
        valid: false,
        message: `تم تجاهل ${fileCount} ملف/ملفات لكون حجمها أكبر من ${MAX_FILE_SIZE_MB} ميجابايت: ${fileNames}`
      };
    }
    
    return { valid: true, message: '' };
  };

  const handleEditProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProperty) return;
    
    // Check file sizes before proceeding
    if (editSelectedImages.length > 0) {
      const sizeCheck = checkFileSizes(editSelectedImages);
      if (!sizeCheck.valid) {
        alert(sizeCheck.message);
        return;
      }
    }
    
    try {
      const formData = new FormData();
      
      // Add all property data to formData
      Object.entries(editProperty).forEach(([key, value]) => {
        if (key === 'images') return; // Skip images here as we'll handle them separately
        if (key === 'amenities') {
          const amenitiesStr = JSON.stringify(value);
          formData.append(key, amenitiesStr);
        } else if (key === 'chaletSettings') {
          if (value !== null && value !== undefined && value !== '') {
            const str = typeof value === 'string' ? value : JSON.stringify(value);
            formData.append(key, str);
          }
        } else if (key === 'roomSettings') {
          if (value !== null && value !== undefined && value !== '') {
            const str = typeof value === 'string' ? value : JSON.stringify(value);
            formData.append(key, str);
          }
        } else if (key === 'videoUrl') {
          const videoUrl = convertToEmbedUrl(String(value));
          formData.append(key, videoUrl);
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      // Normalize hotel field to always be an ID when type is room/chalet
      if (['room', 'chalet'].includes(String(editProperty.type))) {
        const hotelId = (editProperty.hotel && typeof editProperty.hotel === 'object')
          ? editProperty.hotel._id
          : editProperty.hotel;
        if (hotelId) {
          formData.set('hotel', String(hotelId));
        }
      }

      // Add new images
      editSelectedImages.forEach((file) => {
        formData.append('images', file);
      });
      
      // Add images to be removed
      if (editImagesToRemove.length > 0) {
        formData.append('imagesToRemove', JSON.stringify(editImagesToRemove));
      }
      const response = await axios.put(
        `${API_URL}/properties/${editProperty._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data.success) {
        setShowEditModal(false);
        setEditProperty(null);
        setEditSelectedImages([]);
        setEditImagePreviews([]);
        setEditImagesToRemove([]);
        fetchProperties();
        alert('تم تحديث العقار بنجاح');
      } else {
        alert('فشل في تحديث العقار: ' + response.data.message);
      }
    } catch (error: any) {
      alert('فشل في تحديث العقار: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleShowGallery = (images: string[]) => {
    setGalleryImages(images);
    setShowGalleryModal(true);
  };

  // تم إلغاء خاصية الإخفاء/العرض من الرئيسية

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || property.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">إدارة العقارات</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-gold flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="h-5 w-5" />
              <span>إضافة عقار جديد</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في العقارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-rtl pr-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-rtl"
            >
              <option value="all">جميع العقارات</option>
              <option value="hotel">الفنادق</option>
              <option value="chalet">الشاليهات</option>
            </select>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">
                {filteredProperties.length} عقار
              </span>
            </div>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              className={`px-3 py-2 rounded-lg text-white ${selectedIds.length ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!selectedIds.length}
              onClick={handleBulkDelete}
            >
              حذف المحدد ({selectedIds.length})
            </button>
            <button
              className="px-3 py-2 rounded-lg border"
              onClick={() => selectAllCurrent(filteredProperties)}
            >
              تحديد الكل (الظاهر)
            </button>
            {selectedIds.length > 0 && (
              <button className="px-3 py-2 rounded-lg border" onClick={clearSelection}>مسح التحديد</button>
            )}
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? 'جاري التحميل...' : (
            filteredProperties.map((property) => (
              <div key={property._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative">
                  {/* Select checkbox */}
                  <div className="absolute top-3 right-3 z-10 bg-white/90 rounded-md p-1 shadow">
                    <input
                      type="checkbox"
                      checked={isSelected(property._id)}
                      onChange={() => toggleSelected(property._id)}
                    />
                  </div>
                  <img
                    src={property.images && property.images.length > 0 ? property.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      property.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {property.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {property.type === 'hotel' ? 'فندق' : 'شاليه'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 ml-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-gold fill-current ml-1" />
                      <span className="font-semibold">{property.rating}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        {property.price.toLocaleString('ar-SA')}
                      </span>
                      <span className="text-gray-600 mr-1">ريال</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">{property.bookings}</div>
                      <div className="text-gray-600">حجز</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">{property.revenue}</div>
                      <div className="text-gray-600">إيراد</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between space-x-2 space-x-reverse">
                    <button className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
                      onClick={() => navigate(`/property/${property._id || property.id}`)}>
                      <Eye className="h-4 w-4 ml-1" />
                      <span className="text-sm">تفاصيل</span>
                    </button>
                    <button className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
                      onClick={() => handleEditClick(property)}>
                      <Edit className="h-4 w-4 ml-1" />
                      <span className="text-sm">تعديل</span>
                    </button>
                    <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center"
                      onClick={() => handleCloneProperty(property)}>
                      <span className="text-sm">نسخ</span>
                    </button>
                    <button className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center justify-center" onClick={() => handleDeleteProperty(property._id)}>
                      <Trash2 className="h-4 w-4 ml-1" />
                      <span className="text-sm">حذف</span>
                    </button>
                  </div>

                  {(property.type === 'chalet' || property.type === 'room') && property.hotel && (
                    <div className="mt-3 text-sm text-gray-600">
                      تابع لـ: <span className="font-semibold">{getHotelName(property.hotel) || (property.type === 'room' ? 'فندق' : 'منتجع')}</span>
                    </div>
                  )}

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">إضافة عقار جديد</h2>
            </div>
            
            <form onSubmit={handleAddProperty} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم العقار *
                  </label>
                  <input
                    type="text"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                    required
                    className="input-rtl"
                    placeholder="أدخل اسم العقار"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع العقار *
                  </label>
                  <select
                    value={newProperty.type}
                    onChange={(e) => setNewProperty({...newProperty, type: e.target.value})}
                    className="input-rtl"
                  >
                    <option value="hotel">فندق</option>
                    <option value="chalet">شاليه</option>
                    <option value="room">غرفة</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموقع *</label>
                  <input
                    type="text"
                    value={newProperty.location}
                    onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
                    required
                    className="input-rtl"
                    placeholder="أدخل الموقع (مثال: الرياض، المملكة العربية السعودية)"
                  />
                </div>

                {/* اختيار الفندق للأب في كل من الشاليه والغرفة */}
                {['chalet','room'].includes(newProperty.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      {newProperty.type === 'chalet' ? 'المنتجع/الفندق التابع له الشاليه *' : 'الفندق التابع له الغرفة *'}
                  </label>
                    <select
                      value={(newProperty as any).hotel || ''}
                      onChange={(e) => setNewProperty({ ...newProperty, hotel: e.target.value })}
                    required
                    className="input-rtl"
                    >
                      <option value="">اختر الفندق</option>
                      {hotels.map((h: any) => (
                        <option key={h._id} value={h._id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                </div>

              {/* تسعير أساسي */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر لليلة (ريال) *
                  </label>
                  <input
                    type="number"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                    required
                    className="input-rtl"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سعر الخصم العام (اختياري)</label>
                  <input
                    type="number"
                    value={newProperty.discountPrice}
                    onChange={(e) => setNewProperty({ ...newProperty, discountPrice: e.target.value })}
                    className="input-rtl"
                    placeholder="خصم عام (ريال)"
                  />
                </div>

              {/* إعدادات الغرفة عند اختيار النوع غرفة */}
              {newProperty.type === 'room' && (
                <div className="space-y-6">
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">مواصفات الغرفة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المساحة (م²)</label>
                  <input
                    type="number"
                    className="input-rtl"
                          onChange={(e) => setNewProperty((prev: any) => ({...prev, roomSettings: { ...(prev.roomSettings||{}), specifications: { ...(prev.roomSettings?.specifications||{}), size: Number(e.target.value)||0 } } }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الطابق</label>
                        <input
                          type="number"
                          className="input-rtl"
                          onChange={(e) => setNewProperty((prev: any) => ({...prev, roomSettings: { ...(prev.roomSettings||{}), specifications: { ...(prev.roomSettings?.specifications||{}), floor: Number(e.target.value)||0 } } }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الإطلالة</label>
                        <input
                          type="text"
                          placeholder="مثال: sea/garden"
                          className="input-rtl"
                          onChange={(e) => setNewProperty((prev: any) => ({...prev, roomSettings: { ...(prev.roomSettings||{}), specifications: { ...(prev.roomSettings?.specifications||{}), view: e.target.value } } }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع السرير</label>
                        <select
                          className="input-rtl"
                          onChange={(e) => setNewProperty((prev: any) => ({...prev, roomSettings: { ...(prev.roomSettings||{}), specifications: { ...(prev.roomSettings?.specifications||{}), bedType: e.target.value } } }))}
                        >
                          <option value="double">سرير مزدوج</option>
                          <option value="single">سرير فردي</option>
                          <option value="queen">كوين</option>
                          <option value="king">كينج</option>
                          <option value="twin">توأم</option>
                          <option value="sofa_bed">أريكة سرير</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للإشغال</label>
                        <input
                          type="number"
                          className="input-rtl"
                          onChange={(e) => setNewProperty((prev: any) => ({...prev, roomSettings: { ...(prev.roomSettings||{}), specifications: { ...(prev.roomSettings?.specifications||{}), maxOccupancy: Number(e.target.value)||1 } } }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عدد البالغين</label>
                        <input
                          type="number"
                          className="input-rtl"
                          onChange={(e) => setNewProperty((prev: any) => ({...prev, roomSettings: { ...(prev.roomSettings||{}), specifications: { ...(prev.roomSettings?.specifications||{}), maxAdults: Number(e.target.value)||1 } } }))}
                        />
                      </div>
                </div>
              </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">التسعير المتقدم</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأساسي</label>
                        <input type="number" className="input-rtl" onChange={(e)=>setNewProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),pricing:{...(prev.roomSettings?.pricing||{}),basePrice:Number(e.target.value)||0}}}))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العملة</label>
                        <select className="input-rtl" onChange={(e)=>setNewProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),pricing:{...(prev.roomSettings?.pricing||{}),currency:e.target.value}}}))}>
                          <option value="SAR">ريال سعودي</option>
                          <option value="USD">دولار</option>
                          <option value="EUR">يورو</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">سعر الشخص الإضافي</label>
                        <input type="number" className="input-rtl" onChange={(e)=>setNewProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),pricing:{...(prev.roomSettings?.pricing||{}),extraPersonPrice:Number(e.target.value)||0}}}))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">سعر السرير الإضافي</label>
                        <input type="number" className="input-rtl" onChange={(e)=>setNewProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),pricing:{...(prev.roomSettings?.pricing||{}),extraBedPrice:Number(e.target.value)||0}}}))} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">التوفر (ستوك)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">إجمالي الوحدات</label>
                        <input type="number" className="input-rtl" onChange={(e)=>setNewProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),availability:{...(prev.roomSettings?.availability||{}),totalUnits:Number(e.target.value)||1}}}))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الوحدات المتاحة</label>
                        <input type="number" className="input-rtl" onChange={(e)=>setNewProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),availability:{...(prev.roomSettings?.availability||{}),availableUnits:Number(e.target.value)||0}}}))} />
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked onChange={(e)=>setNewProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),availability:{...(prev.roomSettings?.availability||{}),isActive:e.target.checked}}}))} />
                        <label className="text-sm font-medium text-gray-700">نشط</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الفيديو (اختياري)
                </label>
                <input
                  type="url"
                  value={newProperty.videoUrl}
                  onChange={(e) => setNewProperty({...newProperty, videoUrl: e.target.value})}
                  className="input-rtl"
                  placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                />
                <p className="text-sm text-gray-500 mt-1">
                  أدخل رابط YouTube العادي (مثال: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={newProperty.description}
                  onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                  rows={4}
                  className="input-rtl"
                  placeholder="وصف العقار..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المرافق والخدمات
                </label>
                <div className="space-y-4">
                  {newProperty.amenities.map((amenity, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نوع المرفق
                        </label>
                        <input
                          type="text"
                          value={amenity.title}
                          onChange={(e) => {
                            const newAmenities = [...newProperty.amenities];
                            newAmenities[index].title = e.target.value;
                            setNewProperty({...newProperty, amenities: newAmenities});
                          }}
                          className="input-rtl"
                          placeholder="مثل: واي فاي، مسبح، مطعم..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تفاصيل المرفق
                        </label>
                        <textarea
                          value={amenity.body}
                          onChange={(e) => {
                            const newAmenities = [...newProperty.amenities];
                            newAmenities[index].body = e.target.value;
                            setNewProperty({...newProperty, amenities: newAmenities});
                          }}
                          rows={3}
                          className="input-rtl"
                          placeholder="تفاصيل إضافية مفصولة بفواصل..."
                        />
                      </div>
                      {newProperty.amenities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newAmenities = newProperty.amenities.filter((_, i) => i !== index);
                            setNewProperty({...newProperty, amenities: newAmenities});
                          }}
                          className="md:col-span-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
                        >
                          حذف المرفق
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setNewProperty({
                        ...newProperty, 
                        amenities: [...newProperty.amenities, { title: '', body: '' }]
                      });
                    }}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
                  >
                    + إضافة مرفق جديد
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صور العقار (يمكنك اختيار حتى 5 صور)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="input-rtl"
                />
                {/* Image previews */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative w-20 h-20">
                      <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover rounded" />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1"
                        onClick={() => {
                          const newFiles = [...selectedImages];
                          const newPreviews = [...imagePreviews];
                          newFiles.splice(idx, 1);
                          newPreviews.splice(idx, 1);
                          setSelectedImages(newFiles);
                          setImagePreviews(newPreviews);
                        }}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-3"
                >
                  إضافة العقار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {showEditModal && editProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">تعديل العقار</h2>
            </div>
            <form onSubmit={handleEditProperty} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم العقار *</label>
                  <input
                    type="text"
                    value={editProperty.name}
                    onChange={(e) => setEditProperty({ ...editProperty, name: e.target.value })}
                    required
                    className="input-rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع العقار *</label>
                  <select
                    value={editProperty.type}
                    onChange={(e) => setEditProperty({ ...editProperty, type: e.target.value })}
                    className="input-rtl"
                  >
                    <option value="hotel">فندق</option>
                    <option value="chalet">شاليه</option>
                    <option value="room">غرفة</option>
                  </select>
                </div>

                {editProperty.type === 'chalet' || editProperty.type === 'room' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{editProperty.type === 'chalet' ? 'المنتجع/الفندق التابع له الشاليه *' : 'الفندق التابع له الغرفة *'}</label>
                    <select
                      value={(editProperty.hotel && typeof editProperty.hotel === 'object' ? editProperty.hotel._id : editProperty.hotel) || ''}
                      onChange={(e) => setEditProperty({ ...editProperty, hotel: e.target.value })}
                      required
                      className="input-rtl"
                    >
                      <option value="">اختر الفندق</option>
                      {hotels.map((h: any) => (
                        <option key={h._id} value={h._id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              {editProperty.type === 'room' && (
                <div className="space-y-6">
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">مواصفات الغرفة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المساحة (م²)</label>
                        <input type="number" className="input-rtl" value={editProperty.roomSettings?.specifications?.size || ''} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),specifications:{...(prev.roomSettings?.specifications||{}),size:Number(e.target.value)||0}}}))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الطابق</label>
                        <input type="number" className="input-rtl" value={editProperty.roomSettings?.specifications?.floor || ''} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),specifications:{...(prev.roomSettings?.specifications||{}),floor:Number(e.target.value)||0}}}))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الإطلالة</label>
                        <input type="text" className="input-rtl" value={editProperty.roomSettings?.specifications?.view || ''} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),specifications:{...(prev.roomSettings?.specifications||{}),view:e.target.value}}}))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع السرير</label>
                        <select className="input-rtl" value={editProperty.roomSettings?.specifications?.bedType || 'double'} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),specifications:{...(prev.roomSettings?.specifications||{}),bedType:e.target.value}}}))}>
                          <option value="double">سرير مزدوج</option>
                          <option value="single">سرير فردي</option>
                          <option value="queen">كوين</option>
                          <option value="king">كينج</option>
                          <option value="twin">توأم</option>
                          <option value="sofa_bed">أريكة سرير</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للإشغال</label>
                        <input type="number" className="input-rtl" value={editProperty.roomSettings?.specifications?.maxOccupancy || ''} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),specifications:{...(prev.roomSettings?.specifications||{}),maxOccupancy:Number(e.target.value)||1}}}))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عدد البالغين</label>
                        <input type="number" className="input-rtl" value={editProperty.roomSettings?.specifications?.maxAdults || ''} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),specifications:{...(prev.roomSettings?.specifications||{}),maxAdults:Number(e.target.value)||1}}}))} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">التسعير المتقدم</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأساسي</label>
                        <input type="number" className="input-rtl" value={editProperty.roomSettings?.pricing?.basePrice || ''} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),pricing:{...(prev.roomSettings?.pricing||{}),basePrice:Number(e.target.value)||0}}}))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العملة</label>
                        <select className="input-rtl" value={editProperty.roomSettings?.pricing?.currency || 'SAR'} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),pricing:{...(prev.roomSettings?.pricing||{}),currency:e.target.value}}}))}>
                          <option value="SAR">ريال سعودي</option>
                          <option value="USD">دولار</option>
                          <option value="EUR">يورو</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">سعر الشخص الإضافي</label>
                        <input type="number" className="input-rtl" value={editProperty.roomSettings?.pricing?.extraPersonPrice || ''} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),pricing:{...(prev.roomSettings?.pricing||{}),extraPersonPrice:Number(e.target.value)||0}}}))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">سعر السرير الإضافي</label>
                        <input type="number" className="input-rtl" value={editProperty.roomSettings?.pricing?.extraBedPrice || ''} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),pricing:{...(prev.roomSettings?.pricing||{}),extraBedPrice:Number(e.target.value)||0}}}))} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">التوفر (ستوك)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">إجمالي الوحدات</label>
                        <input type="number" className="input-rtl" value={editProperty.roomSettings?.availability?.totalUnits || ''} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),availability:{...(prev.roomSettings?.availability||{}),totalUnits:Number(e.target.value)||1}}}))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الوحدات المتاحة</label>
                        <input type="number" className="input-rtl" value={editProperty.roomSettings?.availability?.availableUnits || ''} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),availability:{...(prev.roomSettings?.availability||{}),availableUnits:Number(e.target.value)||0}}}))} />
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-2" checked={!!editProperty.roomSettings?.availability?.isActive} onChange={(e)=>setEditProperty((prev:any)=>({...prev,roomSettings:{...(prev.roomSettings||{}),availability:{...(prev.roomSettings?.availability||{}),isActive:e.target.checked}}}))} />
                        <label className="text-sm font-medium text-gray-700">نشط</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموقع *</label>
                  <input
                    type="text"
                    value={editProperty.location}
                    onChange={(e) => setEditProperty({ ...editProperty, location: e.target.value })}
                    required
                    className="input-rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعر لليلة (ريال) *</label>
                  <input
                    type="number"
                    value={editProperty.price}
                    onChange={(e) => setEditProperty({ ...editProperty, price: e.target.value })}
                    required
                    className="input-rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سعر الخصم العام (اختياري)</label>
                  <input
                    type="number"
                    value={editProperty.discountPrice || ''}
                    onChange={(e) => setEditProperty({ ...editProperty, discountPrice: e.target.value })}
                    className="input-rtl"
                    placeholder="خصم عام (ريال)"
                  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رابط الفيديو (اختياري)</label>
                <input
                  type="url"
                  value={editProperty.videoUrl || ''}
                  onChange={(e) => setEditProperty({ ...editProperty, videoUrl: e.target.value })}
                  className="input-rtl"
                  placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                />
                <p className="text-sm text-gray-500 mt-1">
                  أدخل رابط YouTube العادي (مثال: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                <textarea
                  value={editProperty.description}
                  onChange={(e) => setEditProperty({ ...editProperty, description: e.target.value })}
                  rows={4}
                  className="input-rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المرافق والخدمات</label>
                <div className="space-y-4">
                  {editProperty.amenities.map((amenity: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نوع المرفق
                        </label>
                        <input
                          type="text"
                          value={amenity.title}
                          onChange={(e) => {
                            const newAmenities = [...editProperty.amenities];
                            newAmenities[index].title = e.target.value;
                            setEditProperty({...editProperty, amenities: newAmenities});
                          }}
                          className="input-rtl"
                          placeholder="مثل: واي فاي، مسبح، مطعم..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تفاصيل المرفق
                        </label>
                        <textarea
                          value={amenity.body}
                          onChange={(e) => {
                            const newAmenities = [...editProperty.amenities];
                            newAmenities[index].body = e.target.value;
                            setEditProperty({...editProperty, amenities: newAmenities});
                          }}
                          rows={3}
                          className="input-rtl"
                          placeholder="تفاصيل إضافية مفصولة بفواصل..."
                        />
                      </div>
                      {editProperty.amenities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newAmenities = editProperty.amenities.filter((_: any, i: number) => i !== index);
                            setEditProperty({...editProperty, amenities: newAmenities});
                          }}
                          className="md:col-span-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
                        >
                          حذف المرفق
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setEditProperty({
                        ...editProperty, 
                        amenities: [...editProperty.amenities, { title: '', body: '' }]
                      });
                    }}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
                  >
                    + إضافة مرفق جديد
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الصور الحالية</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editProperty.images && editProperty.images.map((img: string, idx: number) => (
                    <div key={idx} className="relative w-20 h-20">
                      <img src={img} alt={`current-${idx}`} className="w-full h-full object-cover rounded" />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1"
                        onClick={() => handleRemoveExistingImage(img)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">إضافة صور جديدة (يمكنك اختيار حتى 5 صور)</label>
                <div className="mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditImageChange}
                    className="input-rtl w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1 text-right">
                    الحد الأقصى لحجم الملف: 10 ميجابايت (JPEG, PNG, WebP فقط)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editImagePreviews.map((src, idx) => (
                    <div key={idx} className="relative w-20 h-20">
                      <img src={src} alt={`preview-edit-${idx}`} className="w-full h-full object-cover rounded" />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1"
                        onClick={() => handleRemoveNewImage(idx)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-3"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">معرض صور العقار</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {galleryImages.map((img, idx) => (
                <img key={idx} src={img} alt={`gallery-${idx}`} className="w-48 h-32 object-cover rounded" />
              ))}
            </div>
            <button
              className="mt-6 btn-gold px-6 py-2"
              onClick={() => setShowGalleryModal(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProperties;