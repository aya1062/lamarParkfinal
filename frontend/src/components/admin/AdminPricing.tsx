import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Plus, Edit, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import { api } from '../../utils/api';

const AdminPricing = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [showAddPriceModal, setShowAddPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any>(null);
  const [pricing, setPricing] = useState<{ [propertyId: string]: { [date: string]: any } }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState({
    date: '',
    price: '',
    discountPrice: '',
    available: true,
    reason: ''
  });

  // جلب العقارات عند التحميل
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const res = await api.getProperties();
      console.log('PROPERTIES DATA:', res.data);
      let propsArr = [];
      if (Array.isArray(res.data)) {
        propsArr = res.data;
      } else if (res.data && Array.isArray(res.data.properties)) {
        propsArr = res.data.properties;
      }
      setProperties(propsArr);
      if (propsArr.length > 0) setSelectedProperty(propsArr[0]._id);
      setLoading(false);
    };
    fetchProperties();
  }, []);

  // جلب الأسعار عند تغيير العقار أو الشهر
  useEffect(() => {
    if (!selectedProperty) return;
    const fetchPricing = async () => {
      setLoading(true);
      const res = await api.getPricing(selectedProperty, selectedMonth);
      if (res.success) {
        // تحويل البيانات إلى شكل { [date]: { price, available, reason } }
        const priceMap: { [date: string]: any } = {};
        (res.data.pricing || []).forEach((item: any) => {
          priceMap[item.date] = {
            price: item.price,
            discountPrice: item.discountPrice,
            available: item.available,
            reason: item.reason,
            _id: item._id
          };
        });
        setPricing(prev => ({ ...prev, [selectedProperty]: priceMap }));
      } else {
        setError(res.message);
      }
      setLoading(false);
    };
    fetchPricing();
  }, [selectedProperty, selectedMonth]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const generateCalendar = () => {
    if (!Array.isArray(properties) || !selectedProperty) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayPricing = pricing[selectedProperty]?.[dateStr];
      const basePrice = Array.isArray(properties)
        ? (properties.find((p: any) => p._id === selectedProperty)?.price || 0)
        : 0;
      days.push({
        day,
        date: dateStr,
        price: dayPricing?.price ?? basePrice,
        discountPrice: dayPricing?.discountPrice ?? 0,
        available: dayPricing?.available ?? true,
        reason: dayPricing?.reason || '',
        isCustom: !!dayPricing
      });
    }

    return days;
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setLoading(true);
    const res = await api.addPricing({
      property: selectedProperty,
      date: newPrice.date,
      price: parseInt(newPrice.price),
      discountPrice: newPrice.discountPrice ? parseInt(newPrice.discountPrice) : undefined,
      available: newPrice.available,
      reason: newPrice.reason
    });
    if (res.success) {
      // إعادة تحميل الأسعار بعد الإضافة
      const fetchPricing = async () => {
        const res = await api.getPricing(selectedProperty, selectedMonth);
        if (res.success) {
          const priceMap: { [date: string]: any } = {};
          (res.data.pricing || []).forEach((item: any) => {
            priceMap[item.date] = {
              price: item.price,
              discountPrice: item.discountPrice,
              available: item.available,
              reason: item.reason,
              _id: item._id
            };
          });
          setPricing(prev => ({ ...prev, [selectedProperty]: priceMap }));
        }
      };
      await fetchPricing();
      setShowAddPriceModal(false);
      setNewPrice({ date: '', price: '', discountPrice: '', available: true, reason: '' });
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleEditPrice = (date: string, currentData: any) => {
    // جلب _id من pricing state بدلاً من currentData
    const pricingData = pricing[selectedProperty]?.[date];
    if (!pricingData || !pricingData._id) {
      setError('لا يمكن تعديل سعر بدون معرف (_id) صالح.');
      return;
    }
    setEditingPrice({
      date,
      _id: pricingData._id,
      price: currentData.price,
      discountPrice: currentData.discountPrice,
      available: currentData.available,
      reason: currentData.reason
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPrice || !selectedProperty || !editingPrice._id) {
      setError('لا يمكن تعديل سعر بدون معرف (_id) صالح.');
      return;
    }
    setLoading(true);
    const res = await api.updatePricing(editingPrice._id, {
      price: editingPrice.available ? parseInt(editingPrice.price) : 0,
      discountPrice: editingPrice.discountPrice ? parseInt(editingPrice.discountPrice) : undefined,
      available: editingPrice.available,
      reason: editingPrice.reason
    });
    if (res.success) {
      // إعادة تحميل الأسعار بعد التعديل
      const fetchPricing = async () => {
        const res = await api.getPricing(selectedProperty, selectedMonth);
        if (res.success) {
          const priceMap: { [date: string]: any } = {};
          (res.data.pricing || []).forEach((item: any) => {
            priceMap[item.date] = {
              price: item.price,
              discountPrice: item.discountPrice,
              available: item.available,
              reason: item.reason,
              _id: item._id
            };
          });
          setPricing(prev => ({ ...prev, [selectedProperty]: priceMap }));
        }
      };
      await fetchPricing();
      setEditingPrice(null);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleDeletePrice = async (date: string) => {
    if (!selectedProperty || !pricing[selectedProperty]?.[date]?._id) return;
    const confirmed = window.confirm('هل أنت متأكد أنك تريد حذف هذا السعر المخصص؟');
    if (!confirmed) return;
    setLoading(true);
    const res = await api.deletePricing(pricing[selectedProperty][date]._id);
    if (res.success) {
      // إعادة تحميل الأسعار بعد الحذف
      const fetchPricing = async () => {
        const res = await api.getPricing(selectedProperty, selectedMonth);
        if (res.success) {
          const priceMap: { [date: string]: any } = {};
          (res.data.pricing || []).forEach((item: any) => {
            priceMap[item.date] = {
              price: item.price,
              discountPrice: item.discountPrice,
              available: item.available,
              reason: item.reason,
              _id: item._id
            };
          });
          setPricing(prev => ({ ...prev, [selectedProperty]: priceMap }));
        }
      };
      await fetchPricing();
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const getDayColor = (day: any) => {
    if (!day.available) return 'bg-red-100 border-red-300 text-red-800';
    if (day.isCustom) return 'bg-gold bg-opacity-20 border-gold text-gray-900';
    return 'bg-white border-gray-200 text-gray-900';
  };

  const calendarDays = generateCalendar();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">إدارة التسعير</h1>
            <button
              onClick={() => setShowAddPriceModal(true)}
              className="btn-gold flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="h-5 w-5" />
              <span>إضافة سعر مخصص</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العقار</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="input-rtl"
              >
                {Array.isArray(properties) && properties.map(property => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الشهر</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input-rtl"
              />
            </div>

            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">السعر الأساسي</label>
                <div className="bg-gray-100 px-4 py-3 rounded-lg">
                  <span className="font-bold text-gray-900">
                    {Array.isArray(properties) && properties.find(p => p._id === selectedProperty)?.price?.toLocaleString('ar-SA') || 0} ريال
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">تقويم الأسعار</h3>
          
          {/* Legend */}
          <div className="flex items-center space-x-6 space-x-reverse mb-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded ml-2"></div>
              <span>السعر الأساسي</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gold bg-opacity-20 border border-gold rounded ml-2"></div>
              <span>سعر مخصص</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded ml-2"></div>
              <span>غير متاح</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-50 rounded-lg">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <div 
                    className={`h-full border-2 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all duration-200 ${getDayColor(day)}`}
                    onClick={() => day.isCustom && handleEditPrice(day.date, day)}
                  >
                    <div className="text-sm font-bold mb-1">{day.day}</div>
                    <div className="text-xs">
                      {day.available ? (
                        day.discountPrice ? (
                          <>
                            <span className="line-through text-gray-400 mr-1">{day.price.toLocaleString('ar-SA')}</span>
                            <span className="font-semibold text-green-700">{day.discountPrice.toLocaleString('ar-SA')} ريال</span>
                          </>
                        ) : (
                          <span className="font-semibold">{day.price.toLocaleString('ar-SA')} ريال</span>
                        )
                      ) : (
                        <span className="text-red-600">غير متاح</span>
                      )}
                    </div>
                    {day.reason && (
                      <div className="text-xs text-gray-600 mt-1 truncate" title={day.reason}>
                        {day.reason}
                      </div>
                    )}
                    {day.isCustom && (
                      <div className="flex items-center justify-between mt-1">
                        <Edit className="h-3 w-3 text-gray-500" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePrice(day.date);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Custom Prices List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">الأسعار المخصصة</h3>
          
          {Object.entries(pricing[selectedProperty] || {}).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد أسعار مخصصة لهذا العقار</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(pricing[selectedProperty] || {}).map(([date, data]) => (
                <div key={date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div>
                        <p className="font-semibold text-gray-900">{date}</p>
                        <p className="text-sm text-gray-600">{data.reason}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">
                          {data.available ? (
                            data.discountPrice ? (
                              <>
                                <span className="line-through text-gray-400 mr-1">{data.price.toLocaleString('ar-SA')}</span>
                                <span className="font-semibold text-green-700">{data.discountPrice.toLocaleString('ar-SA')} ريال</span>
                              </>
                            ) : (
                              `${data.price.toLocaleString('ar-SA')} ريال`
                            )
                          ) : 'غير متاح'}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          data.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {data.available ? 'متاح' : 'غير متاح'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEditPrice(date, { ...data, _id: data._id })}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePrice(date)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Price Modal */}
      {showAddPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">إضافة سعر مخصص</h2>
            <form onSubmit={handleAddPrice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                <input
                  type="date"
                  name="date"
                  value={newPrice.date}
                  onChange={e => setNewPrice({ ...newPrice, date: e.target.value })}
                  required
                  className="input-rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السعر الأساسي</label>
                <input
                  type="number"
                  name="price"
                  value={newPrice.price}
                  onChange={e => setNewPrice({ ...newPrice, price: e.target.value })}
                  required
                  className="input-rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سعر الخصم (اختياري)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={newPrice.discountPrice}
                  onChange={e => setNewPrice({ ...newPrice, discountPrice: e.target.value })}
                  className="input-rtl"
                  placeholder="اتركه فارغًا إذا لا يوجد خصم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">متاح للحجز؟</label>
                <select
                  name="available"
                  value={newPrice.available ? 'true' : 'false'}
                  onChange={e => setNewPrice({ ...newPrice, available: e.target.value === 'true' })}
                  className="input-rtl"
                >
                  <option value="true">نعم</option>
                  <option value="false">لا</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سبب التغيير (اختياري)</label>
                <input
                  type="text"
                  name="reason"
                  value={newPrice.reason}
                  onChange={e => setNewPrice({ ...newPrice, reason: e.target.value })}
                  className="input-rtl"
                />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddPriceModal(false)}
                  className="btn-gray"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-gold"
                  disabled={loading}
                >
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {editingPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">تعديل سعر اليوم</h2>
            <form onSubmit={e => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السعر الأساسي</label>
                <input
                  type="number"
                  name="price"
                  value={editingPrice.price}
                  onChange={e => setEditingPrice({ ...editingPrice, price: e.target.value })}
                  required
                  className="input-rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سعر الخصم (اختياري)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={editingPrice.discountPrice || ''}
                  onChange={e => setEditingPrice({ ...editingPrice, discountPrice: e.target.value })}
                  className="input-rtl"
                  placeholder="اتركه فارغًا إذا لا يوجد خصم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">متاح للحجز؟</label>
                <select
                  name="available"
                  value={editingPrice.available ? 'true' : 'false'}
                  onChange={e => setEditingPrice({ ...editingPrice, available: e.target.value === 'true' })}
                  className="input-rtl"
                >
                  <option value="true">نعم</option>
                  <option value="false">لا</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سبب التغيير (اختياري)</label>
                <input
                  type="text"
                  name="reason"
                  value={editingPrice.reason}
                  onChange={e => setEditingPrice({ ...editingPrice, reason: e.target.value })}
                  className="input-rtl"
                />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => setEditingPrice(null)}
                  className="btn-gray"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-gold"
                  disabled={loading}
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing; 