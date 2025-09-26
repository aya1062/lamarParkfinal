import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  MapPin, 
  Shield, 
  Loader, 
  CheckCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const checkoutSchema = yup.object({
  fullName: yup
    .string()
    .required('الاسم الكامل مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: yup
    .string()
    .required('البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح'),
  phone: yup
    .string()
    .required('رقم الهاتف مطلوب')
    .matches(/^(\+966|0)?[5][0-9]{8}$/, 'يرجى إدخال رقم هاتف سعودي صحيح'),
  specialRequests: yup.string()
});

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [priceCalculation, setPriceCalculation] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_arrival'>('cash_on_arrival');

  // التواريخ من URL
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = parseInt(searchParams.get('guests') || '2');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(checkoutSchema)
  });

  // جلب بيانات العقار
  useEffect(() => {
    if (!id) return;
    
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await api.getPropertyById(id);
        if (res.success) {
          setProperty(res.data);
        } else {
          setError('فشل في جلب بيانات العقار');
        }
      } catch (err) {
        setError('حدث خطأ أثناء جلب بيانات العقار');
      }
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  // حساب السعر الديناميكي
  useEffect(() => {
    if (!id || !checkIn || !checkOut) return;

    const calculatePrice = async () => {
      try {
        const res = await api.calculatePrice({
          propertyId: id,
          checkIn,
          checkOut
        });

        if (res.success) {
          setPriceCalculation(res.data);
        } else {
          toast.error(res.message || 'فشل في حساب السعر');
        }
      } catch (err) {
        toast.error('حدث خطأ أثناء حساب السعر');
      }
    };

    calculatePrice();
  }, [id, checkIn, checkOut]);

  // عند تغيير طريقة الدفع، امسح الأخطاء القديمة
  const handlePaymentMethodChange = (method: 'cash_on_arrival') => {
    setPaymentMethod(method);
    setError(null);
  };

  const onSubmit = async (data: any) => {
    setError(null); // امسح أي خطأ عام
    if (!property || !priceCalculation || !id) {
      setError('بيانات غير مكتملة');
      return;
    }
    setIsProcessing(true);
    try {
      const bookingData = {
        property: id,
        dates: {
          checkIn: checkIn || '',
          checkOut: checkOut || '',
          nights: priceCalculation.nights
        },
        guests,
        guest: {
          name: data.fullName,
          email: data.email,
          phone: data.phone
        },
        amount: priceCalculation.totalPrice,
        status: 'pending',
        paymentStatus: 'unpaid',
        specialRequests: data.specialRequests,
        paymentMethod
      };
      if (paymentMethod === 'cash_on_arrival') {
        const res = await api.createBooking(bookingData);
        if (res.success) {
          navigate('/booking/success', { state: { booking: res.booking } });
        } else {
          setError(res.message || 'فشل في إنشاء الحجز');
        }
      }
    } catch (err) {
      setError('حدث خطأ أثناء معالجة الحجز');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل بيانات الحجز...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">حدث خطأ</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate(`/property/${id}`)}
            className="btn-gold w-full"
          >
            العودة للعقار
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* أزرار اختبار سريعة */}
        <div className="mb-4" />
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(`/property/${id}`)}
            className="flex items-center text-gold hover:text-gold-dark mb-4"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للعقار
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إتمام الدفع</h1>
          <p className="text-gray-600">أكمل بياناتك لإتمام عملية الدفع</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <CreditCard className="h-5 w-5 ml-2 text-gold" />
                بيانات الحجز
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Payment Method Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_arrival"
                        checked
                        onChange={() => handlePaymentMethodChange('cash_on_arrival')}
                        className="form-radio text-gold"
                      />
                      <span className="ml-2">الدفع عند الوصول</span>
                    </label>
                  </div>
                </div>
                {/* Guest Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      {...register('fullName')}
                      className={`input-rtl ${errors.fullName ? 'border-red-500' : ''}`}
                      placeholder="الاسم الكامل"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`input-rtl ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className={`input-rtl ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+966 50 123 4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    طلبات خاصة (اختياري)
                  </label>
                  <textarea
                    {...register('specialRequests')}
                    rows={3}
                    className="input-rtl"
                    placeholder="أي طلبات خاصة أو ملاحظات..."
                  />
                </div>

                {/* Payment Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 mt-1 ml-3 text-blue-600" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">أمان الدفع</p>
                      <p>سيتم توجيهك إلى صفحة دفع آمنة من Stripe. لن يتم تخزين بيانات بطاقتك الائتمانية على خوادمنا.</p>
                    </div>
                  </div>
                </div>

                {/* Supported Payment Methods */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">طرق الدفع المدعومة</h4>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex items-center">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" alt="Visa" className="h-8 w-12" />
                    </div>
                    <div className="flex items-center">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg" alt="Mastercard" className="h-8 w-12" />
                    </div>
                    <div className="flex items-center">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amex/amex-original.svg" alt="American Express" className="h-8 w-12" />
                    </div>
                    <div className="text-sm text-gray-600">
                      + المزيد
                    </div>
                  </div>
                </div>

                {/* عرض رسالة الخطأ العامة */}
                {error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
                    {error}
                  </div>
                )}
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing || !priceCalculation}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${
                    isProcessing || !priceCalculation
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'btn-gold'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Loader className="h-5 w-5 animate-spin ml-2" />
                      {paymentMethod === 'cash_on_arrival' ? 'جاري تأكيد الحجز...' : 'جاري التوجيه للدفع...'}
                    </div>
                  ) : (
                    paymentMethod === 'cash_on_arrival'
                      ? `تأكيد الحجز والدفع عند الوصول (${priceCalculation?.totalPrice?.toLocaleString('ar-SA')} ريال)`
                      : `ادفع ${priceCalculation?.totalPrice?.toLocaleString('ar-SA')} ريال`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">ملخص الحجز</h3>

              {/* Property Info */}
              {property && (
                <div className="mb-6">
                  <img 
                    src={property.images?.[0] || property.image} 
                    alt={property.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h4 className="font-bold text-gray-900 mb-2">{property.name}</h4>
                  <p className="text-gray-600 text-sm flex items-center">
                    <MapPin className="h-4 w-4 ml-1" />
                    {property.location}
                  </p>
                </div>
              )}

              {/* Booking Details */}
              {priceCalculation && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">تاريخ الوصول</span>
                    <span className="font-semibold">
                      {new Date(checkIn || '').toLocaleDateString('ar-SA')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">تاريخ المغادرة</span>
                    <span className="font-semibold">
                      {new Date(checkOut || '').toLocaleDateString('ar-SA')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">عدد الليالي</span>
                    <span className="font-semibold">{priceCalculation.nights}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">عدد الأشخاص</span>
                    <span className="font-semibold">{guests}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between font-bold text-lg">
                      <span>المجموع</span>
                      <span className="text-gold">
                        {priceCalculation.totalPrice?.toLocaleString('ar-SA')} ريال
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center text-green-800 text-sm">
                  <CheckCircle className="h-4 w-4 ml-2" />
                  <span>دفع آمن عبر Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 