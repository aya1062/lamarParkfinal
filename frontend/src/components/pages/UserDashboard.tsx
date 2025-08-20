import React, { useState, useEffect } from 'react';
import { User, Calendar, CreditCard, Settings, Bell, MapPin, Star, Eye, X, Edit } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../utils/api';
import { toast } from 'react-hot-toast';

const UserDashboard = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null); // للحجز المحدد

  // State لحقول الملف الشخصي
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nationalId: user?.nationalId || '',
    address: user?.address || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [nationalIdError, setNationalIdError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setBookingsLoading(true);
      setBookingsError(null);
      const res = await api.getUserBookings();
      if (res.success) {
        setUserBookings(res.data);
      } else {
        setBookingsError(res.message || 'فشل في جلب الحجوزات');
      }
      setBookingsLoading(false);
    };
    fetchBookings();

    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      nationalId: user?.nationalId || '',
      address: user?.address || ''
    });
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    if (e.target.name === 'nationalId') {
      if (e.target.value && !isValidSaudiNationalId(e.target.value)) {
        setNationalIdError('الرقم القومي يجب أن يكون رقم سعودي صحيح (10 أرقام ويبدأ بـ 1 أو 2)');
      } else {
        setNationalIdError(null);
      }
    }
  };

  const isValidSaudiNationalId = (id: string) => {
    return /^([12])\d{9}$/.test(id);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('user:', user);
    if (!user) return;
    // تحقق من الرقم القومي
    if (profileData.nationalId && !isValidSaudiNationalId(profileData.nationalId)) {
      setNationalIdError('الرقم القومي يجب أن يكون رقم سعودي صحيح (10 أرقام ويبدأ بـ 1 أو 2)');
      return;
    }
    setProfileLoading(true);
    const res = await api.updateUser(user.id, profileData);
    setProfileLoading(false);
    if (res.success) {
      updateUser(profileData);
      toast.success('تم تحديث بياناتك بنجاح');
    } else {
      toast.error(res.message || 'فشل في تحديث البيانات');
    }
  };

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: User },
    { id: 'bookings', name: 'حجوزاتي', icon: Calendar },
    { id: 'payments', name: 'المدفوعات', icon: CreditCard },
    { id: 'profile', name: 'الملف الشخصي', icon: Settings },
    { id: 'notifications', name: 'الإشعارات', icon: Bell }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'upcoming': return 'قادم';
      case 'cancelled': return 'ملغي';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً، {user?.name}</h1>
          <p className="text-gray-600">إدارة حسابك وحجوزاتك من مكان واحد</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gold bg-opacity-20 rounded-full flex items-center justify-center ml-4">
                  <User className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-right transition-colors duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gold text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="mr-4">
                        <p className="text-sm font-medium text-gray-600">إجمالي الحجوزات</p>
                        <p className="text-2xl font-bold text-gray-900">{userBookings.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-full">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="mr-4">
                        <p className="text-sm font-medium text-gray-600">إجمالي الإنفاق</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {userBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString('ar-SA')} ريال
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-gold bg-opacity-20 rounded-full">
                        <Star className="h-6 w-6 text-gold" />
                      </div>
                      <div className="mr-4">
                        <p className="text-sm font-medium text-gray-600">نقاط الولاء</p>
                        <p className="text-2xl font-bold text-gray-900">1,250</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">أحدث الحجوزات</h3>
                  <div className="space-y-4">
                    {userBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <img 
                            src={booking.property.image} 
                            alt={booking.property.name}
                            className="w-16 h-16 rounded-lg object-cover ml-4"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">{booking.property.name}</h4>
                            <p className="text-sm text-gray-600">{booking.dates.checkIn} - {booking.dates.checkOut}</p>
                            <p className="text-sm text-gray-500">{booking.property.location}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">{booking.amount.toLocaleString('ar-SA')} ريال</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">جميع حجوزاتي</h3>
                <div className="space-y-6">
                  {bookingsLoading && <p>جاري تحميل الحجوزات...</p>}
                  {bookingsError && <p className="text-red-500">{bookingsError}</p>}
                  {!bookingsLoading && !bookingsError && userBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start">
                          <img 
                            src={booking.property.image} 
                            alt={booking.property.name}
                            className="w-20 h-20 rounded-lg object-cover ml-4"
                          />
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">{booking.property.name}</h4>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 ml-1" />
                              <span className="text-sm">{booking.property.location}</span>
                            </div>
                            <p className="text-sm text-gray-600">رقم الحجز: #{booking.id}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">تاريخ الوصول</p>
                          <p className="font-semibold">{booking.dates.checkIn}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">تاريخ المغادرة</p>
                          <p className="font-semibold">{booking.dates.checkOut}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">عدد الأشخاص</p>
                          <p className="font-semibold">{booking.guests} أشخاص</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">إجمالي المبلغ</p>
                          <p className="text-xl font-bold text-gray-900">{booking.amount.toLocaleString('ar-SA')} ريال</p>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={() => setSelectedBooking(booking)}>
                            <Eye className="h-4 w-4 ml-1" />
                            <span>عرض التفاصيل</span>
                          </button>
                          {booking.status === 'upcoming' && (
                            <button className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                              <X className="h-4 w-4 ml-1" />
                              <span>إلغاء</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">الملف الشخصي</h3>
                <form className="space-y-6" onSubmit={handleProfileSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className="input-rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="input-rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="input-rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الرقم القومي</label>
                      <input
                        type="text"
                        name="nationalId"
                        value={profileData.nationalId}
                        onChange={handleProfileChange}
                        className="input-rtl"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      {nationalIdError && (
                        <p className="text-red-500 text-sm mt-1">{nationalIdError}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                    <textarea
                      rows={3}
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      className="input-rtl"
                      placeholder="أدخل عنوانك الكامل"
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-4 space-x-reverse">
                    <button type="button" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                      إلغاء
                    </button>
                    <button type="submit" className="btn-gold px-6 py-3" disabled={profileLoading}>
                      {profileLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Other tabs content would go here */}
          </div>
        </div>
      </div>
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full relative">
            <button onClick={() => setSelectedBooking(null)} className="absolute top-4 left-4 text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">تفاصيل الحجز</h2>
            <div className="flex items-center mb-4">
              <img src={selectedBooking.property.image} alt={selectedBooking.property.name} className="w-24 h-24 rounded-lg object-cover ml-4" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedBooking.property.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 ml-1" />
                  <span className="text-sm">{selectedBooking.property.location}</span>
                </div>
                <p className="text-sm text-gray-600">رقم الحجز: #{selectedBooking.bookingNumber || selectedBooking.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">تاريخ الوصول</p>
                <p className="font-semibold">{selectedBooking.dates.checkIn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">تاريخ المغادرة</p>
                <p className="font-semibold">{selectedBooking.dates.checkOut}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">عدد الأشخاص</p>
                <p className="font-semibold">{selectedBooking.guests} أشخاص</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الحالة</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(selectedBooking.status)}`}>{getStatusText(selectedBooking.status)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-sm text-gray-600">إجمالي المبلغ</p>
                <p className="text-xl font-bold text-gray-900">{selectedBooking.amount.toLocaleString('ar-SA')} ريال</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الحجز</p>
                <p className="font-semibold">{selectedBooking.bookingNumber || selectedBooking.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard; 