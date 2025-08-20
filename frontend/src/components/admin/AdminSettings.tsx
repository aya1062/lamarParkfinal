import React, { useState } from 'react';
import { Save, Upload, Globe, Bell, Shield, CreditCard, Mail, Phone } from 'lucide-react';
import { getSettings, updateSettings } from '../../utils/api';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    getSettings()
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setError('فشل في جلب الإعدادات');
        setLoading(false);
      });
  }, []);

  const tabs = [
    { id: 'general', name: 'عام', icon: Globe },
    { id: 'booking', name: 'الحجوزات', icon: Bell },
    { id: 'payment', name: 'المدفوعات', icon: CreditCard },
    { id: 'notifications', name: 'الإشعارات', icon: Mail },
    { id: 'security', name: 'الأمان', icon: Shield }
  ];

  const handleSave = async () => {
    setMessage(null);
    setError(null);
    try {
      await updateSettings(settings);
      setMessage('تم حفظ التغييرات بنجاح');
    } catch {
      setError('فشل في حفظ التغييرات');
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
            <button
              onClick={handleSave}
              className="btn-gold flex items-center space-x-2 space-x-reverse"
            >
              <Save className="h-5 w-5" />
              <span>حفظ التغييرات</span>
            </button>
          </div>
        </div>
      </div>
      {message && <div className="max-w-7xl mx-auto mt-4 text-green-600">{message}</div>}
      {error && <div className="max-w-7xl mx-auto mt-4 text-red-600">{error}</div>}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
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

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">الإعدادات العامة</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم الموقع
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                        className="input-rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        العملة
                      </label>
                      <select
                        value={settings.general.currency}
                        onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                        className="input-rtl"
                      >
                        <option value="SAR">ريال سعودي (SAR)</option>
                        <option value="USD">دولار أمريكي (USD)</option>
                        <option value="EUR">يورو (EUR)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وصف الموقع
                      </label>
                      <textarea
                        value={settings.general.siteDescription}
                        onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                        rows={3}
                        className="input-rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                        className="input-rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        value={settings.general.contactPhone}
                        onChange={(e) => handleInputChange('general', 'contactPhone', e.target.value)}
                        className="input-rtl"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        العنوان
                      </label>
                      <input
                        type="text"
                        value={settings.general.address}
                        onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                        className="input-rtl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Settings */}
              {activeTab === 'booking' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">إعدادات الحجوزات</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ساعات الإلغاء المجاني
                      </label>
                      <input
                        type="number"
                        value={settings.booking.cancellationHours}
                        onChange={(e) => handleInputChange('booking', 'cancellationHours', parseInt(e.target.value))}
                        className="input-rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        أقصى مدة للحجز المسبق (أيام)
                      </label>
                      <input
                        type="number"
                        value={settings.booking.maxAdvanceBookingDays}
                        onChange={(e) => handleInputChange('booking', 'maxAdvanceBookingDays', parseInt(e.target.value))}
                        className="input-rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        أقل مدة للحجز (أيام)
                      </label>
                      <input
                        type="number"
                        value={settings.booking.minBookingDays}
                        onChange={(e) => handleInputChange('booking', 'minBookingDays', parseInt(e.target.value))}
                        className="input-rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.booking.autoConfirmBookings}
                        onChange={(e) => handleInputChange('booking', 'autoConfirmBookings', e.target.checked)}
                        className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">تأكيد الحجوزات تلقائياً</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.booking.requirePaymentUpfront}
                        onChange={(e) => handleInputChange('booking', 'requirePaymentUpfront', e.target.checked)}
                        className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">طلب الدفع المسبق</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">إعدادات المدفوعات</h2>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">طرق الدفع المتاحة</h3>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.payment.enableCreditCard}
                        onChange={(e) => handleInputChange('payment', 'enableCreditCard', e.target.checked)}
                        className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">البطاقات الائتمانية</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.payment.enableCashOnArrival}
                        onChange={(e) => handleInputChange('payment', 'enableCashOnArrival', e.target.checked)}
                        className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">الدفع عند الوصول</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.payment.enableBankTransfer}
                        onChange={(e) => handleInputChange('payment', 'enableBankTransfer', e.target.checked)}
                        className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">التحويل البنكي</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        معدل الضريبة (%)
                      </label>
                      <input
                        type="number"
                        value={settings.payment.taxRate}
                        onChange={(e) => handleInputChange('payment', 'taxRate', parseFloat(e.target.value))}
                        className="input-rtl"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رسوم المعالجة (ريال)
                      </label>
                      <input
                        type="number"
                        value={settings.payment.processingFee}
                        onChange={(e) => handleInputChange('payment', 'processingFee', parseFloat(e.target.value))}
                        className="input-rtl"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">إعدادات الإشعارات</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">إشعارات البريد الإلكتروني</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailBookingConfirmation}
                            onChange={(e) => handleInputChange('notifications', 'emailBookingConfirmation', e.target.checked)}
                            className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">تأكيد الحجز</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailBookingReminder}
                            onChange={(e) => handleInputChange('notifications', 'emailBookingReminder', e.target.checked)}
                            className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">تذكير بالحجز</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailCancellation}
                            onChange={(e) => handleInputChange('notifications', 'emailCancellation', e.target.checked)}
                            className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">إلغاء الحجز</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">إشعارات الرسائل النصية</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.smsBookingConfirmation}
                            onChange={(e) => handleInputChange('notifications', 'smsBookingConfirmation', e.target.checked)}
                            className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">تأكيد الحجز</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.smsBookingReminder}
                            onChange={(e) => handleInputChange('notifications', 'smsBookingReminder', e.target.checked)}
                            className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">تذكير بالحجز</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">إشعارات المديرين</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.adminEmailNotifications}
                          onChange={(e) => handleInputChange('notifications', 'adminEmailNotifications', e.target.checked)}
                          className="ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">إشعارات البريد الإلكتروني للمديرين</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">إعدادات الأمان</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-yellow-600 ml-2" />
                        <p className="text-sm text-yellow-800">
                          إعدادات الأمان تتطلب صلاحيات إدارية عليا. تواصل مع مطور النظام لإجراء تغييرات.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">تشفير البيانات</h3>
                        <p className="text-sm text-gray-600">جميع البيانات الحساسة مشفرة باستخدام AES-256</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">النسخ الاحتياطي</h3>
                        <p className="text-sm text-gray-600">نسخ احتياطية يومية تلقائية للبيانات</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">مراقبة الأمان</h3>
                        <p className="text-sm text-gray-600">مراقبة مستمرة للأنشطة المشبوهة</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">التحديثات الأمنية</h3>
                        <p className="text-sm text-gray-600">تحديثات أمنية منتظمة للنظام</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;