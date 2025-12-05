import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, AlertTriangle } from 'lucide-react';

/**
 * Payment Error Page
 * Displayed after failed or declined ARB payment
 */
export default function PaymentError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  const reason = searchParams.get('reason') || 'unknown';
  const trackId = searchParams.get('trackId');

  // Map error reasons to user-friendly Arabic messages
  const getErrorMessage = (errorReason: string): { title: string; description: string } => {
    const messages: Record<string, { title: string; description: string }> = {
      'declined': {
        title: 'تم رفض الدفع',
        description: 'تم رفض عملية الدفع من قبل البنك. يرجى التحقق من بيانات البطاقة أو التواصل مع البنك.'
      },
      'CANCELED': {
        title: 'تم إلغاء الدفع',
        description: 'قمت بإلغاء عملية الدفع. يمكنك المحاولة مرة أخرى عندما تكون جاهزاً.'
      },
      'NOT CAPTURED': {
        title: 'فشل في معالجة الدفع',
        description: 'لم يتم التقاط الدفع بنجاح. يرجى المحاولة مرة أخرى.'
      },
      'invalid': {
        title: 'بيانات دفع غير صالحة',
        description: 'تم استلام بيانات دفع غير صالحة. يرجى المحاولة مرة أخرى.'
      },
      'system_error': {
        title: 'خطأ في النظام',
        description: 'حدث خطأ في معالجة عملية الدفع. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.'
      },
      'timeout': {
        title: 'انتهت مهلة الدفع',
        description: 'انتهت مهلة جلسة الدفع. يرجى المحاولة مرة أخرى.'
      }
    };

    return messages[errorReason] || {
      title: 'فشل في إتمام الدفع',
      description: 'حدث خطأ غير متوقع أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.'
    };
  };

  const errorInfo = getErrorMessage(reason);

  useEffect(() => {
    // Countdown timer to redirect back
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/checkout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <XCircle className="relative w-24 h-24 text-red-500" strokeWidth={2} />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            {errorInfo.title}
          </h1>
          <p className="text-lg text-gray-600">
            {errorInfo.description}
          </p>
        </div>

        {/* Error Details Card */}
        {(trackId || reason) && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 mb-8 border border-red-200">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  تفاصيل الخطأ
                </h2>
                <div className="space-y-2 text-sm">
                  {trackId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">رقم التتبع:</span>
                      <span className="text-gray-800 font-mono">{trackId}</span>
                    </div>
                  )}
                  {reason && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">السبب:</span>
                      <span className="text-gray-800 font-mono">{reason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Troubleshooting Tips */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3">نصائح لحل المشكلة:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>تأكد من صحة بيانات البطاقة (الرقم، تاريخ الانتهاء، CVV)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>تحقق من وجود رصيد كافٍ في حسابك البنكي</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>تأكد من أن البطاقة مفعلة للمدفوعات عبر الإنترنت</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>جرب استخدام بطاقة أخرى أو وسيلة دفع مختلفة</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            إعادة المحاولة
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white border-2 border-red-500 text-red-600 py-4 px-6 rounded-xl font-semibold hover:bg-red-50 transition-all duration-300"
          >
            العودة للرئيسية
          </button>
        </div>

        {/* Auto Redirect Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            سيتم توجيهك تلقائياً لإعادة المحاولة خلال{' '}
            <span className="font-bold text-red-600">{countdown}</span> ثانية
          </p>
        </div>

        {/* Support Contact */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">
            هل تحتاج إلى مساعدة؟
          </p>
          <a
            href="/contact"
            className="text-blue-600 hover:text-blue-700 font-medium underline text-sm"
          >
            تواصل مع الدعم الفني
          </a>
        </div>
      </div>
    </div>
  );
}
