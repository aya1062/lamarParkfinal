import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Building, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Eye,
  Plus,
  Bell,
  Settings,
  DollarSign,
  UserCheck,
  Handshake
} from 'lucide-react';
import { api } from '../../utils/api';

const AdminDashboard = () => {
  // إيرادات السنة الحالية
  const [revenueStats, setRevenueStats] = useState<number[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  // إجمالي الإيرادات السنوية
  const totalRevenue = revenueStats.length > 0 ? revenueStats.reduce((a, b) => a + b, 0) : null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setRevenueLoading(true);
      setRevenueError(null);
      const [rev, book, newUsersRes, activeCount, totalBookStats, activePropsStats, totalRevStats] = await Promise.all([
        api.getYearlyRevenueStats(),
        api.getYearlyBookingStats(),
        api.getNewUsersStats(),
        api.getActivePropertiesCount(),
        api.getTotalBookingsStats(),
        api.getActivePropertiesStats(),
        api.getTotalRevenueStats()
      ]);

      if (!mounted) return;

      if (rev.success) setRevenueStats(rev.monthlyRevenue); else setRevenueError(rev.message || 'تعذر جلب بيانات الإيرادات');
      setRevenueLoading(false);

      if (book.success) setBookingStats(book.monthlyBookings); else setBookingError(book.message || 'تعذر جلب إحصائيات الحجوزات');
      setBookingLoading(false);

      if (newUsersRes.success) setNewUsers(newUsersRes.count);
      setNewUsersLoading(false);

      if (activeCount.success) setActiveProperties(activeCount.count);
      setActivePropertiesLoading(false);

      if (totalBookStats.success) setTotalBookingsStats(totalBookStats);
      setTotalBookingsStatsLoading(false);

      if (activePropsStats.success) setActivePropertiesStats(activePropsStats);
      setActivePropertiesStatsLoading(false);

      if (totalRevStats.success) setTotalRevenueStats(totalRevStats);
      setTotalRevenueStatsLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // إحصائيات الحجوزات السنوية
  const [bookingStats, setBookingStats] = useState<number[]>([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // دمجنا جلب الإحصائيات أعلاه في Promise.all

  const totalBookings = bookingStats.length > 0 ? bookingStats.reduce((a, b) => a + b, 0) : null;

  // تعريف متغيرات العملاء الجدد قبل stats
  const [newUsers, setNewUsers] = useState<number | null>(null);
  const [newUsersLoading, setNewUsersLoading] = useState(true);

  // دمجنا جلب الإحصائيات أعلاه في Promise.all

  // تعريف متغيرات العقارات النشطة قبل stats
  const [activeProperties, setActiveProperties] = useState<number | null>(null);
  const [activePropertiesLoading, setActivePropertiesLoading] = useState(true);

  // دمجنا جلب الإحصائيات أعلاه في Promise.all

  // إجمالي الحجوزات
  const [totalBookingsStats, setTotalBookingsStats] = useState<{count: number, change: string, changeType: string} | null>(null);
  const [totalBookingsStatsLoading, setTotalBookingsStatsLoading] = useState(true);
  // دمجنا جلب الإحصائيات أعلاه في Promise.all

  // العقارات النشطة
  const [activePropertiesStats, setActivePropertiesStats] = useState<{count: number, change: string, changeType: string} | null>(null);
  const [activePropertiesStatsLoading, setActivePropertiesStatsLoading] = useState(true);
  // دمجنا جلب الإحصائيات أعلاه في Promise.all

  // إجمالي الإيرادات
  const [totalRevenueStats, setTotalRevenueStats] = useState<{total: number, change: string, changeType: string} | null>(null);
  const [totalRevenueStatsLoading, setTotalRevenueStatsLoading] = useState(true);
  // دمجنا جلب الإحصائيات أعلاه في Promise.all

  // العملاء الجدد
  const [newUsersStats, setNewUsersStats] = useState<{count: number, change: string, changeType: string} | null>(null);
  const [newUsersStatsLoading, setNewUsersStatsLoading] = useState(true);
  useEffect(() => {
    const fetchNewUsersStats = async () => {
      setNewUsersStatsLoading(true);
      const res = await api.getNewUsersStats();
      if (res.success) {
        setNewUsersStats(res);
      }
      setNewUsersStatsLoading(false);
    };
    fetchNewUsersStats();
  }, []);

  // ثم تعريف stats
  const stats = [
    {
      title: 'إجمالي الحجوزات',
      value: totalBookingsStatsLoading ? '...' : totalBookingsStats ? totalBookingsStats.count.toLocaleString('ar-EG') : '0',
      change: totalBookingsStatsLoading ? '...' : totalBookingsStats ? totalBookingsStats.change : '0%',
      changeType: totalBookingsStats && totalBookingsStats.changeType === 'decrease' ? 'decrease' : 'increase',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'العقارات النشطة',
      value: activePropertiesStatsLoading
        ? '...'
        : (activePropertiesStats && typeof activePropertiesStats.count === 'number')
          ? Number(activePropertiesStats.count).toLocaleString('ar-EG')
          : '0',
      change: activePropertiesStatsLoading
        ? '...'
        : (activePropertiesStats && activePropertiesStats.change)
          ? activePropertiesStats.change
          : '0%',
      changeType: activePropertiesStats && activePropertiesStats.changeType === 'decrease' ? 'decrease' : 'increase',
      icon: Building,
      color: 'bg-green-500'
    },
    // حذف بطاقة الإيرادات المرتبطة بالدفع المباشر مؤقتاً
    {
      title: 'العملاء الجدد',
      value: newUsersStatsLoading ? '...' : newUsersStats ? newUsersStats.count.toLocaleString('ar-EG') : '0',
      change: newUsersStatsLoading ? '...' : newUsersStats ? newUsersStats.change : '0%',
      changeType: newUsersStats && newUsersStats.changeType === 'decrease' ? 'decrease' : 'increase',
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  // أحدث الحجوزات
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecent = async () => {
      setRecentLoading(true);
      setRecentError(null);
      const res = await api.getRecentBookings();
      if (res.success) {
        setRecentBookings(res.bookings);
      } else {
        setRecentError(res.message || 'تعذر جلب أحدث الحجوزات');
      }
      setRecentLoading(false);
    };
    fetchRecent();
  }, []);

  const quickActions = [
    {
      title: 'إدارة الفنادق والمنتجعات',
      description: 'إضافة وإدارة الفنادق والمنتجعات',
      icon: Building,
      link: '/admin/hotels',
      color: 'bg-blue-500'
    },
    {
      title: 'إدارة الشاليهات والغرف',
      description: 'إضافة وإدارة الشاليهات والغرف ضمن العقارات',
      icon: Building,
      link: '/admin/properties',
      color: 'bg-purple-500'
    },
    {
      title: 'عرض الحجوزات',
      description: 'إدارة ومتابعة الحجوزات',
      icon: Eye,
      link: '/admin/bookings',
      color: 'bg-orange-500'
    },
    {
      title: 'إدارة التسعير',
      description: 'تحديد أسعار مخصصة للأيام',
      icon: DollarSign,
      link: '/admin/pricing',
      color: 'bg-gold'
    },
    {
      title: 'إدارة الحسابات',
      description: 'إضافة وإدارة حسابات المستخدمين',
      icon: UserCheck,
      link: '/admin/accounts',
      color: 'bg-indigo-500'
    },
    {
      title: 'إدارة الشركاء',
      description: 'إضافة وإدارة شركاء الموقع',
      icon: Handshake,
      link: '/admin/partners',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم الإدارية</h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-6 w-6" />
              </button>
              <Link to="/admin/settings" className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">إجراءات سريعة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300 group"
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">أحدث الحجوزات</h2>
              <Link to="/admin/bookings" className="text-gold hover:text-gold-light text-sm font-medium">
                عرض الكل
              </Link>
            </div>
            <div className="space-y-4">
              {recentLoading ? (
                <div className="text-center text-gray-400">جاري التحميل...</div>
              ) : recentError ? (
                <div className="text-center text-red-500">{recentError}</div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center text-gray-400">لا توجد حجوزات بعد</div>
              ) : (
                recentBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{booking.guest}</h3>
                        <span className="text-sm text-gray-500">#{booking.id}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{booking.property}</p>
                      <p className="text-xs text-gray-500">تاريخ الوصول: {booking.checkIn}</p>
                    </div>
                    <div className="text-left ml-4">
                      <p className="font-semibold text-gray-900">{booking.amount?.toLocaleString('ar-EG')} ريال</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        booking.status === 'مؤكد' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'قيد المراجعة'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">الإيرادات الشهرية</h2>
            <div className="h-64 bg-gradient-to-br from-gold to-gold-light rounded-lg flex items-center justify-center">
              <div className="text-center text-white w-full">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-semibold">مخطط الإيرادات</p>
                {revenueLoading ? (
                  <p className="text-sm opacity-80">جاري التحميل...</p>
                ) : revenueError ? (
                  <p className="text-sm opacity-80 text-red-200">{revenueError}</p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                    {revenueStats.map((val, i) => (
                      <div key={i} className="bg-white/20 rounded p-2">
                        <div className="font-bold">{val.toLocaleString('ar-EG')}</div>
                        <div className="opacity-80">{['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][i]}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bookings Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">إحصائيات الحجوزات</h2>
            <div className="h-64 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="text-center text-white w-full">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-semibold">مخطط الحجوزات</p>
                {bookingLoading ? (
                  <p className="text-sm opacity-80">جاري التحميل...</p>
                ) : bookingError ? (
                  <p className="text-sm opacity-80 text-red-200">{bookingError}</p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                    {bookingStats.map((val, i) => (
                      <div key={i} className="bg-white/20 rounded p-2">
                        <div className="font-bold">{val}</div>
                        <div className="opacity-80">{['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][i]}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;