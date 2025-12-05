import { useState , useEffect} from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin,   Camera,  Shield, Award, Phone, Play, X } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [pricing, setPricing] = useState<any>({});
  const [todayPricing, setTodayPricing] = useState<any>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    console.log('Fetching property with ID:', id);
    setLoading(true);
    api.getPropertyById(id).then(res => {
      console.log('API response:', res);
      if (res.success && res.data) {
        console.log('Setting property:', res.data);
        console.log('Property name:', res.data.name);
        console.log('Property price:', res.data.price);
        setProperty(res.data);
      } else {
        console.error('Failed to fetch property:', res.message);
        console.error('Full response:', res);
      }
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching property:', error);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !checkIn || !checkOut) return;
    const fetchPricing = async () => {
      const month = checkIn.slice(0, 7); // YYYY-MM
      const res = await api.getPricing(id, month);
      if (res.success && res.data && Array.isArray(res.data.pricing)) {
        const priceMap: { [date: string]: any } = {};
        res.data.pricing.forEach((item: any) => {
          priceMap[item.date] = item;
        });
        setPricing(priceMap);
      } else {
        setPricing({});
      }
    };
    fetchPricing();
  }, [id, checkIn, checkOut]);

  useEffect(() => {
    if (!property || !property._id) return;
    const today = new Date().toISOString().split('T')[0];
    api.getPricing(property._id, today.slice(0, 7)).then(res => {
      if (res.success && res.data && Array.isArray(res.data.pricing)) {
        const normalizeDate = (dateStr: string) => {
          const d = new Date(dateStr);
          return d.toISOString().split('T')[0];
        };
        const found = res.data.pricing.find((p: any) => normalizeDate(p.date) === today);
        setTodayPricing(found);
      }
    });
  }, [property]);

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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري تحميل بيانات العقار...</p>
        <p className="text-sm text-gray-500 mt-2">ID: {id}</p>
      </div>
    </div>
  );
  
  if (!property) return (
    <div className="min-h-screen bg-gray-50 pt-8 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">العقار غير موجود</h2>
        <p className="text-gray-600 mb-4">العقار الذي تبحث عنه غير متاح</p>
        <p className="text-sm text-gray-500 mb-4">ID: {id}</p>
        <Link to="/chalets" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          العودة للعقارات
        </Link>
      </div>
    </div>
  );

  

  const handleBooking = async () => {
    // التحقق من اختيار التواريخ
    if (!checkIn || !checkOut) {
      toast.error('يرجى اختيار تواريخ الوصول والمغادرة');
      return;
    }

    // التحقق من صحة التواريخ
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      toast.error('تاريخ الوصول لا يمكن أن يكون في الماضي');
      return;
    }

    if (end <= start) {
      toast.error('تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول');
      return;
    }

    // التحقق من توفر العقار في التواريخ المحددة
    try {
      console.log('Sending availability check:', {
        propertyId: property.id || property._id,
        checkIn: checkIn,
        checkOut: checkOut
      });

      const availabilityCheck = await api.checkAvailability({
        propertyId: property.id || property._id,
        checkIn: checkIn,
        checkOut: checkOut
      });

      console.log('Availability response:', availabilityCheck);

      if (!availabilityCheck.success) {
        toast.error(availabilityCheck.message || 'العقار غير متاح في التواريخ المحددة');
        return;
      }

      if (!availabilityCheck.data.available) {
        toast.error('العقار محجوز أو غير متاح في التواريخ المحددة، يرجى اختيار تواريخ أخرى');
        return;
      }

      console.log('Property is available, proceeding to booking page...');

      // الانتقال إلى صفحة الحجز
      const bookingUrl = `/booking/${property._id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
      console.log('Navigating to:', bookingUrl);
      navigate(bookingUrl);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('حدث خطأ أثناء التحقق من توفر العقار، يرجى المحاولة مرة أخرى');
    }
  };

  // حساب المجموع بناءً على أولوية الخصومات والأسعار
  const getDatesInRange = (start: string, end: string) => {
    if (!start || !end) return [];
    const arr = [];
    let dt = new Date(start);
    const endDt = new Date(end);
    while (dt < endDt) {
      arr.push(dt.toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  };
  const nightsArr = checkIn && checkOut ? getDatesInRange(checkIn, checkOut) : [];
  const totalPrice = nightsArr.length > 0 ? nightsArr.reduce((sum, date) => {
    const day = pricing[date];
    if (day && day.discountPrice && day.discountPrice < day.price) {
      return sum + (day.discountPrice || 0);
    } else if (day && typeof day.price === 'number') {
      return sum + (day.price || 0);
    } else if (property.discountPrice && property.discountPrice < property.price) {
      return sum + (property.discountPrice || 0);
    } else {
      return sum + (property.price || 0);
    }
  }, 0) : 0;

  // إذا كان loading أو لا يوجد property، لا نعرض أي شيء
  if (loading || !property) {
    return null; // سيتم التعامل مع هذا في الـ conditions السابقة
  }
  
  // Fallback data في حالة عدم وجود property
  const propertyData = property || {
    name: 'عقار غير محدد',
    location: 'غير محدد',
    price: 0,
    description: 'لا يوجد وصف متاح',
    images: [],
    amenities: [],
    features: {}
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                {Array.isArray(propertyData.images) && propertyData.images.length > 0 ? (
                  <img
                    src={propertyData.images[selectedImage] || propertyData.images[0]}
                    alt={propertyData.name || 'عقار'}
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                ) : (
                  <img
                    src={"https://via.placeholder.com/400x300?text=No+Image"}
                    alt={propertyData.name || 'عقار'}
                    className="w-full h-96 object-cover"
                  />
                )}
                <div className="absolute top-4 right-4">
                  <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg flex items-center">
                    <Camera className="h-4 w-4 ml-1" />
                    <span className="text-sm">{Array.isArray(propertyData.images) ? propertyData.images.length : 0} صور</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  {Array.isArray(propertyData.images) && propertyData.images.length > 1 && propertyData.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`rounded-lg overflow-hidden ${selectedImage === index ? 'ring-2 ring-gold' : ''}`}
                    >
                      <img
                        src={image}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-20 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/100x80?text=Error";
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-center space-x-4 space-x-reverse">
                <button
                  onClick={() => {
                    const phoneNumber = '+966558248265'; // رقم الهاتف المطلوب
                    const message = `مرحباً، أرغب في الاستفسار عن عقار: ${propertyData.name || 'عقار'}`;
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-300"
                >
                  <Phone className="h-5 w-5 ml-2" />
                  <span>تواصل معنا عبر الواتساب</span>
                </button>
                
                <button
                  onClick={() => setShowVideoModal(true)}
                  disabled={!propertyData.videoUrl}
                  className={`flex items-center px-6 py-3 rounded-lg transition-colors duration-300 ${
                    propertyData.videoUrl 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="h-5 w-5 ml-2" />
                  <span>شاهد الفيديو</span>
                </button>
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{propertyData.name}</h1>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-gold fill-current" />
                      <span className="font-semibold mr-1">{propertyData.rating || 0}</span>
                    </div>
                    <span className="text-gray-600">({propertyData.reviewCount || 0} تقييم)</span>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 ml-2 text-gold" />
                  <span>{propertyData.location}</span>
                </div>

                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
                  {propertyData.description}
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">
                    {propertyData.features?.rooms || 'غير محدد'}
                  </div>
                  <div className="text-sm text-gray-600">عدد الغرف</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">
                    {propertyData.features?.type || propertyData.type || 'غير محدد'}
                  </div>
                  <div className="text-sm text-gray-600">نوع الإقامة</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">
                    {propertyData.features?.facilities || 'متوفر'}
                  </div>
                  <div className="text-sm text-gray-600">المرافق</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 text-green-600">
                    <Shield className="h-5 w-5 mx-auto mb-1" />
                  </div>
                  <div className="text-sm text-gray-600">
                    {propertyData.features?.cancellation || 'إلغاء مجاني'}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">المرافق والخدمات</h3>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {(() => {
                    let amenitiesArray = [];
                    
                    // تحويل المرافق من string إلى array إذا كانت string
                    if (typeof propertyData.amenities === 'string') {
                      try {
                        amenitiesArray = JSON.parse(propertyData.amenities);
                      } catch {
                        // إذا فشل التحويل، تحويل إلى array بسيط
                        amenitiesArray = propertyData.amenities.split(',').map((item: string) => ({ 
                          title: item.trim(), 
                          body: '' 
                        }));
                      }
                    } else if (Array.isArray(propertyData.amenities)) {
                      amenitiesArray = propertyData.amenities;
                    }
                    
                    // إذا لم تكن هناك مرافق، عرض رسالة
                    if (!amenitiesArray || amenitiesArray.length === 0) {
                      return (
                        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
                          لا توجد مرافق محددة لهذا العقار
                        </div>
                      );
                    }
                    
                    return amenitiesArray.map((amenity: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-3">{amenity.title || 'مرفق'}</h4>
                        {amenity.body && (
                          <div className="space-y-2">
                            {amenity.body.split(',').map((detail: string, detailIndex: number) => (
                              <div key={detailIndex} className="flex items-center">
                                <Award className="h-4 w-4 text-gold ml-2 flex-shrink-0" />
                                <span className="text-gray-600 text-sm">{detail.trim()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {todayPricing && todayPricing.discountPrice && todayPricing.discountPrice < todayPricing.price ? (
                    <>
                      <span className="line-through text-gray-400 mr-2">{(todayPricing.price || 0).toLocaleString('ar-SA')}</span>
                      <span className="text-gold font-bold">{(todayPricing.discountPrice || 0).toLocaleString('ar-SA')} ريال</span>
                    </>
                  ) : property.discountPrice && property.discountPrice < property.price ? (
                    <>
                      <span className="line-through text-gray-400 mr-2">{(property.price || 0).toLocaleString('ar-SA')}</span>
                      <span className="text-gold font-bold">{(property.discountPrice || 0).toLocaleString('ar-SA')} ريال</span>
                    </>
                  ) : (
                    <span>{((todayPricing?.price || property.price || 0)).toLocaleString('ar-SA')} ريال</span>
                  )}
                </div>
                <div className="text-gray-600">لليلة الواحدة</div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الوصول
                  </label>
                  <input 
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="input-rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ المغادرة
                  </label>
                  <input 
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="input-rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عدد الأشخاص
                  </label>
                  <select 
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="input-rtl"
                  >
                    <option value={1}>شخص واحد</option>
                    <option value={2}>شخصان</option>
                    <option value={3}>3 أشخاص</option>
                    <option value={4}>4 أشخاص</option>
                    <option value={5}>5 أشخاص</option>
                    <option value={6}>6+ أشخاص</option>
                  </select>
                </div>
              </div>

              {checkIn && checkOut && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>عدد الليالي</span>
                    <span>{nightsArr.length}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {nightsArr.map(date => {
                      const day = pricing[date];
                      if (day && day.discountPrice) {
                        return (
                          <div key={date} className="flex justify-between text-gray-600 text-sm">
                            <span>{date}</span>
                            <span>
                              <span className="line-through text-gray-400 mr-1">{(day.price || 0).toLocaleString('ar-SA')}</span>
                              <span className="text-gold font-bold">{(day.discountPrice || 0).toLocaleString('ar-SA')} ريال</span>
                            </span>
                          </div>
                        );
                      } else if (day) {
                        return (
                          <div key={date} className="flex justify-between text-gray-600 text-sm">
                            <span>{date}</span>
                            <span>{(day.price || 0).toLocaleString('ar-SA')} ريال</span>
                          </div>
                        );
                      } else {
                        return (
                          <div key={date} className="flex justify-between text-gray-600 text-sm">
                            <span>{date}</span>
                            <span>{(property.price || 0).toLocaleString('ar-SA')} ريال</span>
                          </div>
                        );
                      }
                    })}
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                    <span>المجموع</span>
                    <span>{(totalPrice || 0).toLocaleString('ar-SA')} ريال</span>
                  </div>
                </div>
              )}

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      if (!checkIn || !checkOut || totalPrice <= 0) return;
                      const bookingUrl = `/checkout/${property._id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
                      navigate(bookingUrl);
                    }}
                    disabled={!checkIn || !checkOut || totalPrice <= 0}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                      !checkIn || !checkOut || totalPrice <= 0
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#DfB86c] to-[#c9a55a] text-white hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    احجز الآن بالدفع الإلكتروني
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!checkIn || !checkOut || totalPrice <= 0) return;
                      const bookingUrl = `/checkout/${property._id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
                      navigate(bookingUrl);
                    }}
                    disabled={!checkIn || !checkOut || totalPrice <= 0}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-all duration-300 border-2 ${
                      !checkIn || !checkOut || totalPrice <= 0
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'border-gold text-gold hover:bg-gold hover:text-white'
                    }`}
                  >
                    احجز الآن - الدفع عند الوصول
                  </button>

                  <Link
                    to="/policies"
                    className="w-full inline-flex items-center justify-center py-3 px-6 rounded-lg font-semibold text-base transition-all duration-300 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  >
                    <Shield className="h-5 w-5 ml-2 text-gold" />
                    سياسة الحجز والإلغاء
                  </Link>
                </div>

              <div className="text-center text-sm text-gray-600 mt-4">
                لن يتم خصم أي مبلغ حتى تأكيد الحجز
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">فيديو العقار</h2>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              {property.videoUrl ? (
                <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={`${convertToEmbedUrl(property.videoUrl)}?autoplay=1`}
                    title="فيديو العقار"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا يوجد فيديو متاح لهذا العقار</p>
                  </div>
                </div>
              )}
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.name}</h3>
                <p className="text-gray-600">شاهد جولة تفصيلية في العقار</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;