import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Calendar, User, MapPin, CreditCard, Eye, Check, X, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewBooking, setPreviewBooking] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    const res = await api.getBookings();
    if (res.success) {
      setBookings(res.data);
    } else {
      setError(res.message || 'فشل في جلب الحجوزات');
      toast.error(res.message || 'فشل في جلب الحجوزات');
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'قيد المراجعة';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوع';
      case 'pending': return 'في الانتظار';
      case 'refunded': return 'مسترد';
      default: return status;
    }
  };

  const filteredBookings = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    return bookings.filter((booking) => {
      const guestName = booking.guest?.name || booking.user?.name || '';
      const propertyName = booking.property?.name || '';
      const matchesSearch = guestName.toLowerCase().includes(term) ||
        (booking._id || '').toLowerCase().includes(term) ||
        propertyName.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      let matchesDate = true;
      const checkIn = new Date(booking.checkIn || booking.dates?.checkIn || 0);
      if (dateFilter === 'today') matchesDate = checkIn >= startOfToday;
      else if (dateFilter === 'week') matchesDate = checkIn >= startOfWeek;
      else if (dateFilter === 'month') matchesDate = checkIn >= startOfMonth;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, debouncedSearch, statusFilter, dateFilter]);

  const pagedBookings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, page, pageSize]);

  // تأكيد الحجز
  const handleConfirmBooking = async (booking: any) => {
    if (!window.confirm('هل تريد تأكيد هذا الحجز؟')) return;
    setActionLoading(true);
    const res = await api.updateBookingStatus(booking._id, 'confirmed');
    if (res.success) {
      setBookings(bookings.map(b => b._id === booking._id ? { ...b, status: 'confirmed' } : b));
      toast.success('تم تأكيد الحجز بنجاح');
    } else {
      toast.error(res.message || 'فشل في تأكيد الحجز');
    }
    setActionLoading(false);
  };

  // إلغاء الحجز
  const handleCancelBooking = async (booking: any) => {
    if (!window.confirm('هل تريد إلغاء هذا الحجز؟')) return;
    setActionLoading(true);
    const res = await api.updateBookingStatus(booking._id, 'cancelled');
    if (res.success) {
      setBookings(bookings.map(b => b._id === booking._id ? { ...b, status: 'cancelled' } : b));
      toast.success('تم إلغاء الحجز');
    } else {
      toast.error(res.message || 'فشل في إلغاء الحجز');
    }
    setActionLoading(false);
  };

  // حذف الحجز
  const handleDeleteBooking = async (booking: any) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحجز نهائياً؟')) return;
    setActionLoading(true);
    const res = await api.deleteBooking(booking._id);
    if (res.success) {
      setBookings(bookings.filter(b => b._id !== booking._id));
      toast.success('تم حذف الحجز');
    } else {
      toast.error(res.message || 'فشل في حذف الحجز');
    }
    setActionLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">إدارة الحجوزات</h1>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-600">
                إجمالي الحجوزات: {filteredBookings.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الحجوزات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-rtl pr-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-rtl"
            >
              <option value="all">جميع الحالات</option>
              <option value="confirmed">مؤكد</option>
              <option value="pending">قيد المراجعة</option>
              <option value="cancelled">ملغي</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-rtl"
            >
              <option value="all">جميع التواريخ</option>
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
            </select>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">
                {filteredBookings.length} حجز
              </span>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="py-3 px-4 text-right">رقم الحجز</th>
                  <th className="py-3 px-4 text-right">اسم العميل</th>
                  <th className="py-3 px-4 text-right">العقار</th>
                  <th className="py-3 px-4 text-right">تاريخ الدخول</th>
                  <th className="py-3 px-4 text-right">تاريخ الخروج</th>
                  <th className="py-3 px-4 text-right">الحالة</th>
                  <th className="py-3 px-4 text-right">الدفع</th>
                  <th className="py-3 px-4 text-right">المبلغ</th>
                  <th className="py-3 px-4 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500 text-lg">
                      لا يوجد حجوزات
                    </td>
                  </tr>
                ) : (
                  pagedBookings.map((booking) => (
                    <tr key={booking._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold">{booking.bookingNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gold bg-opacity-20 flex items-center justify-center">
                            <User className="h-4 w-4 text-gold" />
                          </div>
                          <div>
                            <div className="font-bold">{booking.guest?.name || booking.user?.name || '--'}</div>
                            <div className="text-xs text-gray-500">{booking.guest?.phone || booking.user?.phone || '--'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold">{booking.property?.name || '--'}</div>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-4 w-4 ml-1" />{booking.property?.location || '--'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 ml-1" />{booking.checkIn || booking.dates?.checkIn || '--'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.dates?.nights ? `${booking.dates.nights} ليلة` : ''}
                          {booking.guests ? `، ${booking.guests} أشخاص` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">{booking.checkOut || booking.dates?.checkOut || '--'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>{getStatusText(booking.status)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>{getPaymentStatusText(booking.paymentStatus)}</span>
                      </td>
                      <td className="py-3 px-4">{booking.amount ? booking.amount.toLocaleString('ar-EG') + ' ريال' : '--'}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button title="معاينة" onClick={() => setPreviewBooking(booking)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"><Eye className="h-4 w-4" /></button>
                        {booking.status === 'pending' && (
                          <>
                            <button title="تأكيد" onClick={() => handleConfirmBooking(booking)} disabled={actionLoading} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"><Check className="h-4 w-4" /></button>
                            <button title="إلغاء" onClick={() => handleCancelBooking(booking)} disabled={actionLoading} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"><X className="h-4 w-4" /></button>
                          </>
                        )}
                        <button title="حذف" onClick={() => handleDeleteBooking(booking)} disabled={actionLoading} className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-gray-600">
                عرض {Math.min((page - 1) * pageSize + 1, filteredBookings.length)}-
                {Math.min(page * pageSize, filteredBookings.length)} من {filteredBookings.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded border disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >السابق</button>
                <span className="text-sm">صفحة {page}</span>
                <button
                  className="px-3 py-1 rounded border disabled:opacity-50"
                  onClick={() => setPage((p) => (p * pageSize < filteredBookings.length ? p + 1 : p))}
                  disabled={page * pageSize >= filteredBookings.length}
                >التالي</button>
                <select
                  className="ml-2 border rounded px-2 py-1 text-sm"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الحجوزات المؤكدة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">قيد المراجعة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الحجوزات الملغية</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gold bg-opacity-20 rounded-lg">
                <CreditCard className="h-6 w-6 text-gold" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.amount, 0).toLocaleString('ar-SA')} ريال
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نافذة المعاينة (Modal) */}
      {previewBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">تفاصيل الحجز</h2>
              <button onClick={() => setPreviewBooking(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-4 text-right">
              <div><span className="font-bold">رقم الحجز:</span> {previewBooking._id}</div>
              <div><span className="font-bold">العميل:</span> {previewBooking.guest?.name || previewBooking.user?.name || '--'} ({previewBooking.guest?.phone || previewBooking.user?.phone || '--'})</div>
              <div><span className="font-bold">العقار:</span> {previewBooking.property?.name || '--'} - {previewBooking.property?.location || '--'}</div>
              <div><span className="font-bold">تاريخ الدخول:</span> {previewBooking.checkIn || previewBooking.dates?.checkIn || '--'}</div>
              <div><span className="font-bold">تاريخ الخروج:</span> {previewBooking.checkOut || previewBooking.dates?.checkOut || '--'}</div>
              <div><span className="font-bold">عدد الليالي:</span> {previewBooking.dates?.nights || '--'}</div>
              <div><span className="font-bold">عدد الأشخاص:</span> {previewBooking.guests || '--'}</div>
              <div><span className="font-bold">المبلغ:</span> {previewBooking.amount ? previewBooking.amount.toLocaleString('ar-EG') + ' ريال' : '--'}</div>
              <div><span className="font-bold">الحالة:</span> {getStatusText(previewBooking.status)}</div>
              <div><span className="font-bold">الدفع:</span> {getPaymentStatusText(previewBooking.paymentStatus)}</div>
              {previewBooking.specialRequests && (
                <div><span className="font-bold">طلبات خاصة:</span> {previewBooking.specialRequests}</div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setPreviewBooking(null)} className="btn-gold px-4 py-2">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;