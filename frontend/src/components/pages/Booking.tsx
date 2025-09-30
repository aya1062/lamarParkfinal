import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, CreditCard, Banknote, User, Mail, Phone, Calendar, MapPin, Shield, Loader, AlertTriangle } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<any>({});
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  
  // التواريخ من URL أو القيم الافتراضية
  const [dates, setDates] = useState({
    checkIn: searchParams.get('checkIn') || new Date().toISOString().split('T')[0],
    checkOut: searchParams.get('checkOut') || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    guests: 2,
    specialRequests: '',
    paymentMethod: 'cash'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  const [redirectTimeout, setRedirectTimeout] = useState<any>(null);

  // Mock property data
  const mockProperty = {
    id: '1',
    name: 'فندق الريتز كارلتون الرياض',
    location: 'الرياض، المملكة العربية السعودية',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    checkIn: '2024-02-15',
    checkOut: '2024-02-17',
    nights: 2,
    pricePerNight: 1200,
    total: 2400
  };

  // استخدام البيانات الحقيقية أو الوهمية
  const currentProperty = property || mockProperty;

  // جلب أسعار الأيام للفترة المختارة
  useEffect(() => {
    if (!id || !dates.checkIn || !dates.checkOut) return;
    const fetchPricing = async () => {
      const month = dates.checkIn.slice(0, 7); // YYYY-MM
      const res = await api.getPricing(id, month);
      if (res.success && res.data && Array.isArray(res.data.pricing)) {
        // تحويل إلى {date: {price, discountPrice, ...}}
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
  }, [id, dates.checkIn, dates.checkOut]);

  // حساب المجموع بناءً على discountPrice لكل ليلة
  const getDatesInRange = (start: string, end: string) => {
    const arr = [];
    let dt = new Date(start);
    const endDt = new Date(end);
    while (dt < endDt) {
      arr.push(dt.toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  };

  const nights = Math.ceil((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / (1000 * 60 * 60 * 24));
  const nightsArr = getDatesInRange(dates.checkIn, dates.checkOut);
  const totalPrice = nightsArr.reduce((sum, date) => {
    const day = pricing[date];
    if (day && day.available !== false) {
      return sum + (day.discountPrice || day.price || property?.price || mockProperty.pricePerNight);
    }
    return sum + (property?.price || mockProperty.pricePerNight);
  }, 0);

  // Check availability function
  const checkAvailability = () => {
    // التحقق من صحة التواريخ فقط
    const today = new Date();
    today.setHours(0, 0, 0, 0); // تجاهل الوقت
    const checkInDate = new Date(dates.checkIn);
    const checkOutDate = new Date(dates.checkOut);
    
    if (checkInDate < today) {
      setAvailabilityError('تاريخ الوصول لا يمكن أن يكون في الماضي');
      return false;
    }
    
    if (checkOutDate <= checkInDate) {
      setAvailabilityError('تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول');
      return false;
    }
    
    if (nights < 1) {
      setAvailabilityError('يجب أن تكون مدة الإقامة ليلة واحدة على الأقل');
      return false;
    }
    
    // إزالة التحقق من قاعدة البيانات مؤقتاً للاختبار
    setAvailabilityError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من التوفر قبل الإرسال
    if (!checkAvailability()) {
      toast.error(availabilityError || 'العقار غير متاح في التواريخ المحددة');
      return;
    }
    
    if (totalPrice <= 0) {
      toast.error('لا يمكن إتمام الحجز - السعر غير صحيح');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // Client-side validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      setIsSubmitting(false);
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    // Prepare booking data for backend
    // تعطيل أي بوابات دفع قديمة مؤقتاً
    
    // إذا كان الدفع عند الوصول
    const bookingData = {
      guest: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone
      },
      property: id,
      dates: {
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        nights: nights
      },
      guests: formData.guests,
      amount: totalPrice,
      status: 'pending',
      paymentStatus: 'unpaid',
      specialRequests: formData.specialRequests,
      paymentMethod: 'cash'
    };
    
    const res = await api.createBooking(bookingData);
    setIsSubmitting(false);
    if (res.success && res.booking) {
      setIsSuccess(true);
      setBookingInfo(res.booking);
      toast.success('تم تأكيد الحجز بنجاح! سيتم تحويلك للرئيسية خلال ثوانٍ...');
      const timeout = setTimeout(() => navigate('/'), 5000);
      setRedirectTimeout(timeout);
    } else {
      setIsSuccess(false);
      setError(res.message || 'حدث خطأ أثناء تأكيد الحجز');
      toast.error(res.message || 'حدث خطأ أثناء تأكيد الحجز');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDates({
      ...dates,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    return () => {
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [redirectTimeout]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            تم تأكيد حجزك بنجاح!
          </h2>
          <p className="text-gray-600 mb-4">
            سيتم إرسال تفاصيل الحجز إلى بريدك الإلكتروني قريباً
          </p>
          {bookingInfo && (
            <>
              <div className="mb-2 text-gray-700 text-sm">
                رقم الحجز: <span className="font-semibold">{bookingInfo._id}</span>
              </div>
              <div className="mb-2 text-gray-700 text-sm">
                حالة الحجز: <span className="font-semibold">{bookingInfo.status === 'pending' ? 'قيد المراجعة' : bookingInfo.status === 'confirmed' ? 'مؤكد' : 'ملغي'}</span>
              </div>
            </>
          )}
          <p className="text-sm text-gray-500 mb-8">
            سيتم تحويلك تلقائياً للرئيسية خلال ثوانٍ...
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-gold w-full"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* أزرار اختبار سريعة */}
        {/* أزرار اختبار الدفع القديمة تم تعطيلها مؤقتاً */}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إتمام الحجز</h1>
          <p className="text-gray-600">أكمل بياناتك لتأكيد حجزك</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-gold mx-auto mb-4" />
              <p className="text-gray-600">جاري تحميل بيانات العقار...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {propertyError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 font-semibold mb-2">{propertyError}</div>
            <button 
              onClick={() => navigate('/')}
              className="btn-gold"
            >
              العودة للرئيسية
            </button>
          </div>
        )}

        {/* Main Content - Only show if not loading and no error */}
        {!loading && !propertyError && (
          <>
            {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dates Selection */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Calendar className="h-5 w-5 ml-2 text-gold" />
                      تواريخ الحجز
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تاريخ الوصول *
                        </label>
                        <input
                          type="date"
                          name="checkIn"
                          value={dates.checkIn}
                          onChange={handleDateChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                          className="input-rtl"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تاريخ المغادرة *
                        </label>
                        <input
                          type="date"
                          name="checkOut"
                          value={dates.checkOut}
                          onChange={handleDateChange}
                          min={dates.checkIn}
                          required
                          className="input-rtl"
                        />
                      </div>
                    </div>
                    
                    {availabilityError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-600">
                          <AlertTriangle className="h-4 w-4 ml-2" />
                          <span className="text-sm">{availabilityError}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <User className="h-5 w-5 ml-2 text-gold" />
                      البيانات الشخصية
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم الكامل *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="input-rtl"
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم الهاتف *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="input-rtl"
                          placeholder="+966 50 123 4567"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          البريد الإلكتروني *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="input-rtl"
                          placeholder="your@email.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          عدد الأشخاص
                        </label>
                        <select
                          name="guests"
                          value={formData.guests}
                          onChange={handleInputChange}
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
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        طلبات خاصة (اختياري)
                      </label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={3}
                        className="input-rtl"
                        placeholder="أي طلبات خاصة أو ملاحظات..."
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <CreditCard className="h-5 w-5 ml-2 text-gold" />
                      طريقة الدفع
                    </h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gold transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={formData.paymentMethod === 'cash'}
                          onChange={handleInputChange}
                          className="ml-3 text-gold focus:ring-gold"
                        />
                        <Banknote className="h-5 w-5 ml-3 text-gray-600" />
                        <div>
                          <div className="font-semibold text-gray-900">الدفع عند الوصول</div>
                          <div className="text-sm text-gray-600">ادفع نقداً أو بالبطاقة عند الوصول للفندق</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gold transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="urway"
                          checked={formData.paymentMethod === 'urway'}
                          onChange={handleInputChange}
                          className="ml-3 text-gold focus:ring-gold"
                        />
                        <CreditCard className="h-5 w-5 ml-3 text-gray-600" />
                        <div>
                          <div className="font-semibold text-gray-900">الدفع عبر URWAY</div>
                          <div className="text-sm text-gray-600">ادفع الآن بأمان عبر بوابة الدفع URWAY</div>
                        </div>
                      </label>
                      
                      {/* زر اختبار URWAY مباشر */}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, paymentMethod: 'urway' }));
                          // اختبار URWAY مباشرة
                          const testUrway = async () => {
                            try {
                              const res = await api.createUrwaySession({
                                amount: totalPrice,
                                customerEmail: formData.email || 'test@example.com',
                                customerName: formData.fullName || 'Test User',
                                customerMobile: formData.phone || '+966501234567',
                                trackId: 'TEST_' + Date.now(),
                                currency: 'SAR'
                              });
                              
                              if (res.success && res.paymentUrl) {
                                window.location.href = res.paymentUrl;
                              } else {
                                toast.error(res.message || 'فشل في إنشاء جلسة URWAY');
                              }
                            } catch (err) {
                              toast.error('خطأ في اختبار URWAY');
                            }
                          };
                          testUrway();
                        }}
                        className="w-full mt-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        اختبار URWAY مباشرة
                      </button>
                    </div>
                  </div>

                  {/* Terms and Submit */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start mb-6">
                      <Shield className="h-5 w-5 mt-1 ml-3 text-gold" />
                      <div className="text-sm text-gray-600">
                        <p>بالضغط على "تأكيد الحجز"، أنت توافق على 
                          <a href="#" className="text-gold hover:underline mx-1">الشروط والأحكام</a>
                          و
                          <a href="#" className="text-gold hover:underline mx-1">سياسة الخصوصية</a>
                          الخاصة بلمار بارك.
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${
                        isSubmitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'btn-gold'
                      }`}
                    >
                      {isSubmitting ? 'جاري تأكيد الحجز...' : 'تأكيد الحجز'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Booking Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">ملخص الحجز</h3>
                  
                  <div className="space-y-4">
                    <div className="flex">
                      <img 
                        src={currentProperty.image} 
                        alt={currentProperty.name}
                        className="w-20 h-20 rounded-lg object-cover ml-4"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{currentProperty.name}</h4>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <MapPin className="h-4 w-4 ml-1" />
                          <span>{currentProperty.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 ml-2" />
                        <span className="text-sm">
                          {new Date(dates.checkIn).toLocaleDateString('ar-SA')} - {new Date(dates.checkOut).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-gray-600">
                        <span>عدد الليالي</span>
                        <span>{nights}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        {nightsArr.map(date => {
                          const day = pricing[date];
                          if (day && day.discountPrice) {
                            return (
                              <div key={date} className="flex justify-between text-gray-600 text-sm">
                                <span>{date}</span>
                                <span>
                                  <span className="line-through text-gray-400 mr-1">{day.price.toLocaleString('ar-SA')}</span>
                                  <span className="text-gold font-bold">{day.discountPrice.toLocaleString('ar-SA')} ريال</span>
                                </span>
                              </div>
                            );
                          } else if (day) {
                            return (
                              <div key={date} className="flex justify-between text-gray-600 text-sm">
                                <span>{date}</span>
                                <span>{day.price.toLocaleString('ar-SA')} ريال</span>
                              </div>
                            );
                          } else {
                            return (
                              <div key={date} className="flex justify-between text-gray-600 text-sm">
                                <span>{date}</span>
                                <span>{(property?.price || mockProperty.pricePerNight).toLocaleString('ar-SA')} ريال</span>
                              </div>
                            );
                          }
                        })}
                      </div>
                      
                      <div className="flex justify-between text-gray-600">
                        <span>عدد الأشخاص</span>
                        <span>{formData.guests}</span>
                      </div>
                      
                      {totalPrice > 0 && (
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between font-bold text-lg">
                            <span>المجموع</span>
                            <span className="text-gold">{totalPrice.toLocaleString('ar-SA')} ريال</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center text-green-800 text-sm">
                      <CheckCircle className="h-4 w-4 ml-2" />
                      <span>إلغاء مجاني حتى 24 ساعة قبل الوصول</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Booking;