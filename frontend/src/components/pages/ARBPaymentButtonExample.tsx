import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { CreditCard, Lock } from 'lucide-react';

/**
 * Example: ARB Payment Button Component
 * Add this to your existing Checkout.tsx component
 */

interface PaymentButtonProps {
  booking: any;
  totalAmount: number;
  disabled?: boolean;
}

export function ARBPaymentButton({ booking, totalAmount, disabled }: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      // Validate booking data
      if (!booking || !totalAmount) {
        toast.error('بيانات الحجز غير صالحة');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('جاري تجهيز صفحة الدفع الآمنة...');

      // Call backend to initiate ARB payment
      const response = await api.initiatePayment({
        amount: totalAmount.toFixed(2),
        trackId: booking.bookingNumber || `BK${Date.now()}`,
        bookingId: booking._id
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.success && response.data?.redirectUrl) {
        // Show success message before redirect
        toast.success('جاري التحويل إلى بوابة الدفع...');
        
        // Small delay for UX (let user see the message)
        setTimeout(() => {
          // Redirect to ARB hosted payment page
          window.location.href = response.data.redirectUrl;
        }, 500);
      } else {
        toast.error(response.message || 'فشل في تجهيز صفحة الدفع');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('حدث خطأ أثناء تجهيز الدفع');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">دفع آمن ومشفر</p>
          <p className="text-blue-700">
            ستتم إعادة توجيهك إلى بوابة الدفع الآمنة لبنك الراجحي لإتمام عملية الدفع بأمان
          </p>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={disabled || isProcessing}
        className={`
          w-full py-4 px-6 rounded-xl font-bold text-lg
          flex items-center justify-center gap-3
          transition-all duration-300
          ${disabled || isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#DfB86c] to-[#c9a55a] text-white hover:shadow-xl hover:scale-105'
          }
        `}
      >
        <CreditCard className="w-6 h-6" />
        {isProcessing ? 'جاري التجهيز...' : 'تأكيد الحجز والدفع'}
      </button>

      {/* Accepted Cards */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">نقبل الدفع عبر:</p>
        <div className="flex items-center justify-center gap-4">
          <div className="bg-white border border-gray-200 rounded px-3 py-2 text-xs font-semibold text-gray-700">
            Mada
          </div>
          <div className="bg-white border border-gray-200 rounded px-3 py-2 text-xs font-semibold text-gray-700">
            Visa
          </div>
          <div className="bg-white border border-gray-200 rounded px-3 py-2 text-xs font-semibold text-gray-700">
            MasterCard
          </div>
        </div>
      </div>

      {/* Test Card Info (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
          <p className="font-semibold text-yellow-800 mb-1">🧪 بطاقة اختبار (Sandbox)</p>
          <p className="text-yellow-700 font-mono">
            Card: 4012001037141112 | Exp: 12/2027 | CVV: 212
          </p>
        </div>
      )}
    </div>
  );
}

// =====================================
// USAGE EXAMPLE IN CHECKOUT COMPONENT
// =====================================

/**
 * Example integration in your Checkout.tsx
 */
export default function CheckoutExample() {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ... your existing code to fetch booking data ...

  // Calculate total amount
  const totalAmount = booking?.totalPrice || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Booking Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">ملخص الحجز</h2>
          
          {/* Booking details here */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>الإجمالي:</span>
              <span className="text-[#DfB86c]">{totalAmount.toFixed(2)} ريال</span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#DfB86c]" />
            الدفع الآمن
          </h2>
          
          <ARBPaymentButton
            booking={booking}
            totalAmount={totalAmount}
            disabled={!booking || loading}
          />
        </div>

        {/* Terms and Conditions */}
        <div className="mt-4 text-center text-sm text-gray-500">
          بالمتابعة، أنت توافق على{' '}
          <a href="/policies" className="text-[#DfB86c] hover:underline">
            الشروط والأحكام
          </a>
        </div>
      </div>
    </div>
  );
}
