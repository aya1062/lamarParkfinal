import axios from 'axios';

const API_URL = 'http://31.97.236.52:5000/api';

// إضافة axios interceptor للـ error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // إعادة توجيه للـ login إذا انتهت صلاحية الـ token
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// إضافة axios interceptor لإرسال التوكن تلقائيًا مع كل طلب
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  // تسجيل الدخول
  login: async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/users/login`, { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      return { success: true, ...res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  },

  // التسجيل
  register: async (userData: any) => {
    try {
      const res = await axios.post(`${API_URL}/users/register`, userData);
      return { success: true, ...res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  },

  // الحصول على العقارات
  getProperties: async (filters?: any) => {
    try {
      const res = await axios.get(`${API_URL}/properties`, { params: filters });
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch properties' };
    }
  },

  // جلب عقار واحد حسب الـ ID
  getPropertyById: async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/properties/${id}`);
      console.log('Raw API response:', res.data);
      // الباك إند يرجع { success: true, data: property }
      return { success: true, data: res.data.data };
    } catch (err: any) {
      console.error('Error in getPropertyById:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to fetch property' };
    }
  },

  // إنشاء حجز
  createBooking: async (bookingData: any) => {
    try {
      const res = await axios.post(`${API_URL}/bookings`, bookingData);
      return { success: true, booking: res.data.booking };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Booking failed' };
    }
  },

  // إرسال رسالة اتصال
  sendContactMessage: async (messageData: any) => {
    try {
      const res = await axios.post(`${API_URL}/contact`, messageData);
    return { success: true, message: 'تم إرسال رسالتك بنجاح' };
    } catch (err: any) {
      return { success: false, message: 'فشل في إرسال الرسالة' };
    }
  },

  // الحصول على الحجوزات
  getBookings: async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings`);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch bookings' };
    }
  },

  // جلب الأسعار لعقار معين وشهر معين
  getPricing: async (propertyId: string, month: string) => {
    try {
      const res = await axios.get(`${API_URL}/pricing`, {
        params: { propertyId, month }
      });
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch pricing' };
    }
  },

  // إضافة سعر جديد
  addPricing: async (data: any) => {
    try {
      const res = await axios.post(`${API_URL}/pricing`, data);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to add pricing' };
    }
  },

  // تعديل سعر موجود
  updatePricing: async (id: string, data: any) => {
    try {
      const res = await axios.put(`${API_URL}/pricing/${id}`, data);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to update pricing' };
    }
  },

  // حذف سعر
  deletePricing: async (id: string) => {
    try {
      const res = await axios.delete(`${API_URL}/pricing/${id}`);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete pricing' };
    }
  },

  // التحقق من توفر العقار في تواريخ معينة
  checkAvailability: async (data: { propertyId: string, checkIn: string, checkOut: string }) => {
    try {
      const res = await axios.post(`${API_URL}/properties/check-availability`, data);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to check availability' };
    }
  },

  // حساب السعر الديناميكي
  calculatePrice: async (data: { propertyId: string, checkIn: string, checkOut: string }) => {
    try {
      const res = await axios.post(`${API_URL}/pricing/calculate`, data);
      return { success: true, data: res.data.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to calculate price' };
    }
  },

  // احذف أو عطل كل دوال Stripe (createCheckoutSession وأي دوال أو تعليقات تخص Stripe)
  // جلب تفاصيل جلسة الدفع
  getSessionDetails: async (sessionId: string) => {
    try {
      const res = await axios.get(`${API_URL}/checkout/session/${sessionId}`);
      return { success: true, data: res.data.session };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to get session details' };
    }
  },

  // جلب جميع المدفوعات
  getAllPayments: async () => {
    try {
      const res = await axios.get(`${API_URL}/payments`);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch payments' };
    }
  },

  // جلب مدفوعات المستخدم
  getUserPayments: async () => {
    try {
      const res = await axios.get(`${API_URL}/payments/user`);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch user payments' };
    }
  },

  // جلب جميع المستخدمين
  getAllUsers: async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'فشل في جلب المستخدمين' };
    }
  },

  // تحديث بيانات مستخدم
  updateUser: async (id: string, data: any) => {
    try {
      const res = await axios.put(`${API_URL}/users/${id}`, data);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'فشل في تحديث المستخدم' };
    }
  },

  // حذف مستخدم
  deleteUser: async (id: string) => {
    try {
      const res = await axios.delete(`${API_URL}/users/${id}`);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'فشل في حذف المستخدم' };
    }
  },

  // جلب إحصائيات الإيرادات السنوية
  getYearlyRevenueStats: async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/revenue/yearly`);
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch yearly revenue stats' };
    }
  },

  // جلب أحدث 5 حجوزات
  getRecentBookings: async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/recent`);
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch recent bookings' };
    }
  },

  // جلب إحصائيات عدد الحجوزات السنوية
  getYearlyBookingStats: async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/bookings/yearly`);
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch yearly booking stats' };
    }
  },

  // جلب عدد العملاء الجدد
  getNewUsersStats: async () => {
    try {
      const res = await axios.get(`${API_URL}/users/stats/new-full`);
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch new users stats' };
    }
  },

  // جلب عدد العقارات النشطة
  getActivePropertiesCount: async () => {
    try {
      const res = await axios.get(`${API_URL}/properties/stats/active`);
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch active properties count' };
    }
  },

  // جلب إحصائيات إجمالي الحجوزات مع نسبة التغيير السنوي
  getTotalBookingsStats: async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/stats/total`);
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch total bookings stats' };
    }
  },

  // جلب إحصائيات الإيرادات مع نسبة التغيير السنوي
  getTotalRevenueStats: async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/stats/revenue`);
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch total revenue stats' };
    }
  },

  // جلب إحصائيات العقارات النشطة مع نسبة التغيير السنوي
  getActivePropertiesStats: async () => {
    try {
      const res = await axios.get(`${API_URL}/properties/stats/active-full`);
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch active properties stats' };
    }
  },

  // إنشاء جلسة URWAY
  createUrwaySession: async (data: any) => {
    try {
      const res = await axios.post(`${API_URL}/urway/create-urway-session`, data);
      return { success: true, ...res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'URWAY session failed' };
    }
  },

  // إنشاء دفع مباشر
  createPayment: async (data: any) => {
    try {
      const res = await axios.post(`${API_URL}/payments/create`, data);
      return { success: true, ...res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Payment creation failed' };
    }
  },

  // تحديث حالة الحجز
  updateBookingStatus: async (bookingId: string, status: string) => {
    try {
      const res = await axios.patch(`${API_URL}/bookings/${bookingId}/status`, { status });
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to update booking status' };
    }
  },

  // حذف حجز
  deleteBooking: async (bookingId: string) => {
    try {
      const res = await axios.delete(`${API_URL}/bookings/${bookingId}`);
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete booking' };
    }
  },

  // جلب حجوزات المستخدم الحالي
  getUserBookings: async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/user`);
      return { success: true, data: res.data.bookings };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch user bookings' };
    }
  },

  // جلب حجز عبر رقم الحجز (bookingNumber)
  getBookingByNumber: async (bookingNumber: string) => {
    try {
      const res = await axios.get(`${API_URL}/bookings/number/${bookingNumber}`);
      return { success: true, booking: res.data.booking };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Booking not found' };
    }
  }
};

// جلب إعدادات الموقع
export async function getSettings() {
  const res = await axios.get(`${API_URL}/settings`);
  return res.data;
}

// تحديث إعدادات الموقع
export async function updateSettings(settings: any) {
  const res = await axios.put(`${API_URL}/settings`, settings);
  return res.data;
}