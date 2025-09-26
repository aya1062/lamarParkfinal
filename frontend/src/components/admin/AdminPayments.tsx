import React, { useEffect, useMemo, useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  User, 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Download,
  Filter
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setPayments([]);
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // تم تعطيل منظومة الدفع. لا توجد بيانات لعرضها.
      setPayments([]);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مكتمل';
      case 'failed':
        return 'فشل';
      case 'pending':
        return 'قيد المعالجة';
      default:
        return 'غير معروف';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'stripe':
        return 'بطاقة ائتمانية';
      case 'card':
        return 'بطاقة ائتمانية';
      case 'cash':
        return 'نقداً';
      default:
        return method;
    }
  };

  const filteredPayments = useMemo(() => {
    if (filter === 'all') return payments;
    return payments.filter(payment => payment.status === filter);
  }, [payments, filter]);

  const pagedPayments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, page, pageSize]);

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المدفوعات</h1>
        <p className="text-gray-600">مراقبة وإدارة جميع المدفوعات في النظام</p>
      </div>

      {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500 ml-3" />
            <div>
              <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRevenue.toLocaleString('ar-SA')} ريال
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-500 ml-3" />
            <div>
              <p className="text-sm text-gray-600">إجمالي المدفوعات</p>
                <p className="text-2xl font-bold text-gray-900">
                {payments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 ml-3" />
            <div>
              <p className="text-sm text-gray-600">قيد المعالجة</p>
                <p className="text-2xl font-bold text-gray-900">
                {pendingPayments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500 ml-3" />
            <div>
              <p className="text-sm text-gray-600">فشل في الدفع</p>
              <p className="text-2xl font-bold text-gray-900">
                {failedPayments}
              </p>
            </div>
          </div>
        </div>
            </div>
            
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">المرشحات</h2>
          <div className="flex items-center space-x-4 space-x-reverse">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="all">جميع المدفوعات</option>
              <option value="paid">مكتملة</option>
              <option value="pending">قيد المعالجة</option>
              <option value="failed">فشلت</option>
            </select>
            <button
              onClick={fetchPayments}
              className="btn-gold"
            >
              تحديث
            </button>
          </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المدفوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العقار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    طريقة الدفع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                      <span className="mr-3">جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    لا توجد مدفوعات
                    </td>
                </tr>
              ) : (
                pagedPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 ml-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.booking?.guest?.name || 'غير محدد'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.booking?.guest?.email || 'غير محدد'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-400 ml-2" />
                        <div className="text-sm text-gray-900">
                          {payment.booking?.property?.name || 'غير محدد'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.amount?.toLocaleString('ar-SA')} ريال
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 ml-1" />
                        <span className="text-sm text-gray-900">
                          {getPaymentMethodText(payment.paymentMethod)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className="text-sm text-gray-900 mr-2">
                        {getStatusText(payment.status)}
                      </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetails(true);
                        }}
                        className="text-gold hover:text-gold-dark ml-3"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
        </div>
        </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-600">
          عرض {Math.min((page - 1) * pageSize + 1, filteredPayments.length)}-
          {Math.min(page * pageSize, filteredPayments.length)} من {filteredPayments.length}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</button>
          <span className="text-sm">صفحة {page}</span>
          <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => setPage(p => (p * pageSize < filteredPayments.length ? p + 1 : p))} disabled={page * pageSize >= filteredPayments.length}>التالي</button>
          <select className="ml-2 border rounded px-2 py-1 text-sm" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">تفاصيل الدفع</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">رقم الدفع</label>
                  <p className="text-sm text-gray-900">{selectedPayment._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">المبلغ</label>
                  <p className="text-sm text-gray-900 font-semibold">
                    {selectedPayment.amount?.toLocaleString('ar-SA')} ريال
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">طريقة الدفع</label>
                  <p className="text-sm text-gray-900">
                    {getPaymentMethodText(selectedPayment.paymentMethod)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">الحالة</label>
                  <div className="flex items-center">
                    {getStatusIcon(selectedPayment.status)}
                    <span className="text-sm text-gray-900 mr-2">
                      {getStatusText(selectedPayment.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">تاريخ الدفع</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedPayment.paymentDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">العملة</label>
                  <p className="text-sm text-gray-900">{selectedPayment.currency || 'SAR'}</p>
                </div>
              </div>

              {/* Stripe Information */}
              {selectedPayment.stripeSessionId && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">معلومات Stripe</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Session ID</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedPayment.stripeSessionId}</p>
                    </div>
                    {selectedPayment.stripePaymentIntentId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Intent ID</label>
                        <p className="text-sm text-gray-900 font-mono">{selectedPayment.stripePaymentIntentId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Booking Information */}
              {selectedPayment.booking && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">معلومات الحجز</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">رقم الحجز</label>
                      <p className="text-sm text-gray-900">{selectedPayment.booking._id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">العقار</label>
                      <p className="text-sm text-gray-900">{selectedPayment.booking.property?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">تاريخ الوصول</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedPayment.booking.dates?.checkIn).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">تاريخ المغادرة</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedPayment.booking.dates?.checkOut).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-3 space-x-reverse">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;