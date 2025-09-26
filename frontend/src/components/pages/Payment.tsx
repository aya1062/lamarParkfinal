import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import LoadingSpinner from '../common/LoadingSpinner';
import Toast from '../common/Toast';

interface PaymentFormData {
  amount: number;
  customerEmail: string;
  trackId: string;
}

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { currentBooking } = useBookingStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get booking details from location state or booking store
  const bookingDetails = location.state?.booking || currentBooking;

  const [formData, setFormData] = useState<PaymentFormData>({
    amount: bookingDetails?.totalPrice || 0,
    customerEmail: user?.email || '',
    trackId: `BOOKING_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: formData.amount,
          trackId: formData.trackId,
          customerEmail: formData.customerEmail,
          country: 'SA',
          currency: 'SAR'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('تم تأكيد الحجز والدفع عند الوصول');
      } else {
        setError(data.message || 'حدث خطأ في إنشاء عملية الدفع');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">لا توجد تفاصيل حجز</h2>
          <p className="text-gray-600 mb-4">يرجى العودة إلى صفحة الحجز</p>
          <button
            onClick={() => navigate('/booking')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            العودة للحجز
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            إتمام عملية الدفع
          </h1>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">ملخص الحجز</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">العقار:</span>
                <span className="font-medium">{bookingDetails.property?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الوصول:</span>
                <span className="font-medium">{new Date(bookingDetails.checkIn).toLocaleDateString('ar-SA')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ المغادرة:</span>
                <span className="font-medium">{new Date(bookingDetails.checkOut).toLocaleDateString('ar-SA')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">عدد الليالي:</span>
                <span className="font-medium">{bookingDetails.nights} ليلة</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-semibold">المبلغ الإجمالي:</span>
                <span className="text-blue-600 font-bold text-lg">{formData.amount} ريال</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ (ريال سعودي)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Payment Methods Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">طرق الدفع المتاحة:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• البطاقات الائتمانية (فيزا، ماستركارد، مدى)</li>
                <li>• البطاقات البنكية</li>
                <li>• التحويلات البنكية</li>
                <li>• المحافظ الإلكترونية</li>
              </ul>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-green-800">أمان الدفع</h4>
                  <p className="text-sm text-green-700 mt-1">
                    جميع المعاملات محمية بتقنيات التشفير المتقدمة. لن يتم حفظ بيانات البطاقة على خوادمنا.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="mr-2">جاري إنشاء عملية الدفع...</span>
                </>
              ) : (
                'إتمام الدفع'
              )}
            </button>
          </form>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/booking')}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              العودة إلى صفحة الحجز
            </button>
          </div>
        </div>
      </div>

      {/* Toast Messages */}
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError('')}
        />
      )}
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess('')}
        />
      )}
    </div>
  );
};

export default Payment; 