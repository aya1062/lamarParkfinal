import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Phone, Mail, Package, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching user bookings...');
      const res = await api.getUserBookings();
      console.log('getUserBookings response:', res);
      if (res.success && res.data) {
        const bookingsArray = Array.isArray(res.data) ? res.data : [];
        console.log('Setting bookings:', bookingsArray.length, 'bookings');
        setBookings(bookingsArray);
      } else {
        console.error('Failed to fetch bookings:', res.message);
        setError(res.message || 'فشل في جلب الحجوزات');
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('حدث خطأ أثناء جلب الحجوزات');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '--';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '--';
      return dateObj.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        calendar: 'gregory'
      });
    } catch {
      return '--';
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-5 w-5" />;
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوع';
      case 'unpaid': return 'غير مدفوع';
      case 'partial': return 'مدفوع جزئياً';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات الحجوزات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم العميل</h1>
              <p className="text-gray-600">مرحباً بك، {user?.name || 'عزيزي العميل'}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات الحساب</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <p className="font-semibold text-gray-900">{user?.name || '--'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-semibold text-gray-900">{user?.email || '--'}</p>
              </div>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-sm text-gray-600">رقم الهاتف</p>
                  <p className="font-semibold text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">حجوزاتي</h2>
            <button
              onClick={() => navigate('/chalets')}
              className="btn-gold px-4 py-2"
            >
              حجز جديد
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد حجوزات</h3>
              <p className="text-gray-600 mb-6">لم تقم بأي حجوزات بعد</p>
              <button
                onClick={() => navigate('/chalets')}
                className="btn-gold px-6 py-3"
              >
                استكشف العقارات المتاحة
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id || booking.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {typeof booking.property === 'object' && booking.property?.name
                            ? booking.property.name
                            : booking.property || 'عقار غير محدد'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {getStatusText(booking.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gold" />
                          <span>
                            <span className="font-medium">تاريخ الوصول:</span>{' '}
                            {formatDate(booking.dates?.checkIn || booking.checkIn)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gold" />
                          <span>
                            <span className="font-medium">تاريخ المغادرة:</span>{' '}
                            {formatDate(booking.dates?.checkOut || booking.checkOut)}
                          </span>
                        </div>
                        {booking.dates?.nights && (
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gold" />
                            <span>
                              <span className="font-medium">عدد الليالي:</span> {booking.dates.nights}
                            </span>
                          </div>
                        )}
                        {booking.guests && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gold" />
                            <span>
                              <span className="font-medium">عدد الضيوف:</span> {booking.guests}
                            </span>
                          </div>
                        )}
                      </div>

                      {booking.guest?.name && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">اسم الضيف:</span> {booking.guest.name}
                        </div>
                      )}
                    </div>

                    {/* Booking Actions & Price */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">المبلغ الإجمالي</p>
                        <p className="text-2xl font-bold text-gold">
                          {booking.amount?.toLocaleString('ar-SA') || '0'} ريال
                        </p>
                        {booking.paymentStatus && (
                          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {getPaymentStatusText(booking.paymentStatus)}
                          </span>
                        )}
                      </div>

                      {booking.bookingNumber && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">رقم الحجز:</span> {booking.bookingNumber}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          if (booking._id || booking.id) {
                            navigate(`/booking/success?trackid=${booking.bookingNumber || booking._id || booking.id}`);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;



