import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import Toast from '../common/Toast';

interface TestPaymentData {
  amount: number;
  customerEmail: string;
  trackId: string;
  customerName: string;
  customerPhone: string;
}

const PaymentTest: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<TestPaymentData>({
    amount: 100.00,
    customerEmail: 'test@example.com',
    trackId: `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    customerName: 'عميل تجريبي',
    customerPhone: '+966501234567'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handleTestPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('إرسال طلب الدفع التجريبي:', formData);

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
        },
        body: JSON.stringify({
          amount: formData.amount,
          trackId: formData.trackId,
          customerEmail: formData.customerEmail,
          country: 'SA',
          currency: 'SAR',
          customerName: formData.customerName,
          customerPhone: formData.customerPhone
        })
      });

      const data = await response.json();
      console.log('استجابة الخادم:', data);

      if (data.success) {
        setSuccess('تم إنشاء عملية الدفع التجريبية بنجاح!');
        // في البيئة التجريبية، نعرض البيانات بدلاً من التوجيه
        setTimeout(() => {
          alert(`بيانات الدفع التجريبية:
            Payment URL: ${data.paymentUrl}
            Pay ID: ${data.payId}
            Track ID: ${formData.trackId}
            Amount: ${formData.amount} ريال`);
        }, 1000);
      } else {
        setError(data.message || 'حدث خطأ في إنشاء عملية الدفع التجريبية');
      }
    } catch (err) {
      console.error('خطأ في الدفع التجريبي:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleHashTest = () => {
    // اختبار إنشاء Hash
    const testData = {
      trackId: formData.trackId,
      terminalId: 'test_terminal_123',
      password: 'test_password_123',
      secretKey: 'test_secret_key_123',
      amount: formData.amount,
      currency: 'SAR'
    };

    const hashSequence = `${testData.trackId}|${testData.terminalId}|${testData.password}|${testData.secretKey}|${testData.amount}|${testData.currency}`;
    
    alert(`اختبار Hash:
      Sequence: ${hashSequence}
      Length: ${hashSequence.length} characters`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            تجربة بوابة الدفع URWAY
          </h1>

          {/* Test Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-yellow-800">تجربة الدفع</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  هذه صفحة تجريبية لاختبار تكامل URWAY. البيانات المستخدمة تجريبية ولا تؤدي إلى خصم مبالغ حقيقية.
                </p>
              </div>
            </div>
          </div>

          {/* Test Form */}
          <form onSubmit={handleTestPayment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  اسم العميل
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم العميل"
                />
              </div>

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
                  placeholder="test@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+966501234567"
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
                  placeholder="100.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="trackId" className="block text-sm font-medium text-gray-700 mb-2">
                معرف التتبع (Track ID)
              </label>
              <input
                type="text"
                id="trackId"
                name="trackId"
                value={formData.trackId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="معرف التتبع"
              />
            </div>

            {/* Test Buttons */}
            <div className="flex space-x-4 space-x-reverse">
              <button
                type="button"
                onClick={handleHashTest}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700"
              >
                اختبار Hash
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="mr-2">جاري إنشاء الدفع التجريبي...</span>
                  </>
                ) : (
                  'إنشاء دفع تجريبي'
                )}
              </button>
            </div>
          </form>

          {/* Test Results */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">نتائج الاختبار:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• سيتم عرض بيانات الدفع في نافذة منبثقة</div>
              <div>• يمكنك اختبار Hash منفصلاً</div>
              <div>• جميع البيانات تجريبية</div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              العودة للصفحة الرئيسية
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

export default PaymentTest; 