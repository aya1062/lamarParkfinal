import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Users, CreditCard, ArrowLeft } from 'lucide-react';
import { api } from '../../utils/api';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<any>(location.state?.booking || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trackid = searchParams.get('trackid');
  const result = searchParams.get('result');

  // إذا لم يوجد booking لكن يوجد trackid، جلب الحجز من الباك-إند
  useEffect(() => {
    if (!booking && trackid) {
      setLoading(true);
      api.getBookingByNumber?.(trackid).then((res: any) => {
        if (res.success && res.booking) {
          setBooking(res.booking);
        } else {
          setError('لم يتم العثور على الحجز');
        }
        setLoading(false);
      });
    }
  }, [booking, trackid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin text-gold mx-auto mb-4">⏳</div>
          <p className="text-gray-600">جاري جلب بيانات الحجز...</p>
        </div>
      </div>
    );
  }

  // إذا كان هناك بيانات حجز ونتيجة دفع
  if (booking && result) {
    const isSuccess = result.toLowerCase() === 'successful';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex flex-col items-center mb-6">
            {isSuccess ? (
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FDE68A"/><path d="M7 13l3 3 7-7" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FEE2E2"/><path d="M12 8v4m0 4h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isSuccess ? 'تم الدفع وتأكيد الحجز بنجاح!' : 'فشل الدفع أو تم إلغاؤه'}
          </h2>
          <div className="mb-4 text-gray-700 text-sm">
            رقم الحجز: <span className="font-semibold">{booking.bookingNumber || booking._id}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            حالة الحجز: <span className="font-semibold">{booking.status === 'pending' ? 'قيد المراجعة' : booking.status === 'confirmed' ? 'مؤكد' : 'ملغي'}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            اسم الضيف: <span className="font-semibold">{booking.guest?.name}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            العقار: <span className="font-semibold">{booking.property?.name || booking.property}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            تاريخ الوصول: <span className="font-semibold">{new Date(booking.dates?.checkIn).toLocaleDateString('ar-SA')}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            تاريخ المغادرة: <span className="font-semibold">{new Date(booking.dates?.checkOut).toLocaleDateString('ar-SA')}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            عدد الأشخاص: <span className="font-semibold">{booking.guests}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            المبلغ الإجمالي: <span className="font-semibold">{booking.amount?.toLocaleString('ar-EG')} ريال</span>
          </div>
          <button onClick={() => navigate('/')} className="btn-gold w-full mt-6">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  // إذا كان هناك بيانات حجز فقط (دفع كاش)
  if (booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex flex-col items-center mb-6">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FDE68A"/><path d="M7 13l3 3 7-7" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">تم تأكيد الحجز بنجاح!</h2>
          <div className="mb-4 text-gray-700 text-sm">
            رقم الحجز: <span className="font-semibold">{booking.bookingNumber || booking._id}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            حالة الحجز: <span className="font-semibold">{booking.status === 'pending' ? 'قيد المراجعة' : booking.status === 'confirmed' ? 'مؤكد' : 'ملغي'}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            اسم الضيف: <span className="font-semibold">{booking.guest?.name}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            العقار: <span className="font-semibold">{booking.property?.name || booking.property}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            تاريخ الوصول: <span className="font-semibold">{new Date(booking.dates?.checkIn).toLocaleDateString('ar-SA')}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            تاريخ المغادرة: <span className="font-semibold">{new Date(booking.dates?.checkOut).toLocaleDateString('ar-SA')}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            عدد الأشخاص: <span className="font-semibold">{booking.guests}</span>
          </div>
          <div className="mb-4 text-gray-700 text-sm">
            المبلغ الإجمالي: <span className="font-semibold">{booking.amount?.toLocaleString('ar-EG')} ريال</span>
          </div>
          <button onClick={() => navigate('/')} className="btn-gold w-full mt-6">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  // إذا لم يوجد بيانات حجز ولا trackid، اعرض رسالة الخطأ القديمة
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FEE2E2"/><path d="M12 8v4m0 4h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">حدث خطأ</h2>
        <p className="text-gray-600 mb-6">معرف الحجز غير موجود</p>
        <button onClick={() => navigate('/')} className="btn-gold w-full">العودة للرئيسية</button>
      </div>
    </div>
  );
};

export default BookingSuccess; 