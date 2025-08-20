import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const PaymentResponse: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processPaymentResponse = async () => {
      try {
        // Get all URL parameters from URWAY response
        const params = Object.fromEntries(searchParams.entries());
        
        // Send response to backend for verification
        const response = await fetch('/api/urway/callback?' + searchParams.toString());
        const data = await response.json();

        if (data.success) {
          setPaymentStatus('success');
          setMessage('تم إتمام عملية الدفع بنجاح!');
          
          // إنشاء الحجز بعد نجاح الدفع
          const pendingBooking = localStorage.getItem('pendingBooking');
          if (pendingBooking) {
            try {
              const bookingData = JSON.parse(pendingBooking);
              const bookingResponse = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  ...bookingData,
                  status: 'confirmed',
                  paymentStatus: 'paid',
                  paymentMethod: 'urway'
                })
              });
              
              if (bookingResponse.ok) {
                localStorage.removeItem('pendingBooking');
              }
            } catch (error) {
              console.error('Error creating booking after payment:', error);
            }
          }
        } else {
          setPaymentStatus('failed');
          setMessage(data.message || 'فشلت عملية الدفع');
        }
      } catch (error) {
        console.error('Payment response error:', error);
        setPaymentStatus('failed');
        setMessage('حدث خطأ في معالجة استجابة الدفع');
      } finally {
        setLoading(false);
      }
    };

    processPaymentResponse();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    navigate('/booking');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">جاري معالجة استجابة الدفع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          {paymentStatus === 'success' && (
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}

          {/* Failed Icon */}
          {paymentStatus === 'failed' && (
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className={`text-2xl font-bold mb-4 ${
            paymentStatus === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {paymentStatus === 'success' ? 'تم إتمام الدفع بنجاح' : 'فشلت عملية الدفع'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8">{message}</p>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-right">
            <h3 className="font-semibold mb-2">تفاصيل المعاملة:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">رقم المعاملة:</span>
                <span className="font-medium">{searchParams.get('TranId') || 'غير متوفر'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المبلغ:</span>
                <span className="font-medium">{searchParams.get('amount') || 'غير متوفر'} ريال</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">نوع البطاقة:</span>
                <span className="font-medium">{searchParams.get('cardBrand') || 'غير متوفر'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">رمز الاستجابة:</span>
                <span className="font-medium">{searchParams.get('ResponseCode') || 'غير متوفر'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {paymentStatus === 'success' ? (
              <button
                onClick={handleContinue}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700"
              >
                الانتقال إلى لوحة التحكم
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700"
              >
                إعادة المحاولة
              </button>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>

          {/* Additional Info */}
          {paymentStatus === 'success' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">معلومات إضافية:</h4>
              <ul className="text-sm text-green-700 space-y-1 text-right">
                <li>• سيتم إرسال تأكيد الحجز إلى بريدك الإلكتروني</li>
                <li>• يمكنك متابعة حالة الحجز من لوحة التحكم</li>
                <li>• في حالة وجود أي استفسار، تواصل معنا</li>
              </ul>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">نصائح:</h4>
              <ul className="text-sm text-red-700 space-y-1 text-right">
                <li>• تأكد من صحة بيانات البطاقة</li>
                <li>• تأكد من توفر الرصيد الكافي</li>
                <li>• جرب بطاقة أخرى أو طريقة دفع مختلفة</li>
                <li>• تواصل مع البنك إذا استمرت المشكلة</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResponse; 