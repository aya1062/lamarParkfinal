import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

/**
 * Payment Success Page
 * Displayed after successful ARB payment callback
 */
export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  const paymentId = searchParams.get('paymentId');
  const trackId = searchParams.get('trackId');
  const amount = searchParams.get('amount');
  const ref = searchParams.get('ref');

  useEffect(() => {
    // Countdown timer to redirect to bookings
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/my-bookings');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <CheckCircle className="relative w-24 h-24 text-green-500" strokeWidth={2} />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            الدفع تم بنجاح! ✨
          </h1>
          <p className="text-lg text-gray-600">
            تم تأكيد حجزك وسيتم إرسال التفاصيل إلى بريدك الإلكتروني
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            تفاصيل الدفع
          </h2>
          
          <div className="space-y-3">
            {paymentId && (
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600 font-medium">رقم الدفع:</span>
                <span className="text-gray-800 font-mono">{paymentId}</span>
              </div>
            )}
            
            {trackId && (
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600 font-medium">رقم التتبع:</span>
                <span className="text-gray-800 font-mono">{trackId}</span>
              </div>
            )}
            
            {ref && (
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600 font-medium">المرجع:</span>
                <span className="text-gray-800 font-mono">{ref}</span>
              </div>
            )}
            
            {amount && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">المبلغ المدفوع:</span>
                <span className="text-2xl font-bold text-green-600">
                  {parseFloat(amount).toFixed(2)} ريال
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            عرض حجوزاتي
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white border-2 border-green-500 text-green-600 py-4 px-6 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300"
          >
            العودة للرئيسية
          </button>
        </div>

        {/* Auto Redirect Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            سيتم توجيهك تلقائياً إلى صفحة حجوزاتي خلال{' '}
            <span className="font-bold text-green-600">{countdown}</span> ثانية
          </p>
        </div>

        {/* Print Receipt Option */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.print()}
            className="text-green-600 hover:text-green-700 font-medium underline text-sm"
          >
            طباعة الإيصال
          </button>
        </div>
      </div>
    </div>
  );
}
