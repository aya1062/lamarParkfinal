import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { partnersApi } from '../../utils/api';
import toast from 'react-hot-toast';

interface Partner {
  _id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  category: string;
  order: number;
  isActive: boolean;
}

const AdminPartners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    isActive: true
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await partnersApi.getAllPartners();
      if (response.success) {
        setPartners(response.data);
      } else {
        toast.error('فشل في جلب بيانات الشركاء');
      }
    } catch (error) {
      toast.error('خطأ في جلب بيانات الشركاء');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        name: formData.name,
        logo: formData.logo,
        isActive: formData.isActive,
        category: 'other' // Default category
      };
      
      if (editingPartner) {
        const response = await partnersApi.updatePartner(editingPartner._id, submitData);
        if (response.success) {
          toast.success('تم تحديث الشريك بنجاح');
          fetchPartners();
          resetForm();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await partnersApi.createPartner(submitData);
        if (response.success) {
          toast.success('تم إنشاء الشريك بنجاح');
          fetchPartners();
          resetForm();
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      toast.error('خطأ في حفظ الشريك');
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logo: partner.logo,
      isActive: partner.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الشريك؟')) {
      try {
        const response = await partnersApi.deletePartner(id);
        if (response.success) {
          toast.success('تم حذف الشريك بنجاح');
          fetchPartners();
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error('خطأ في حذف الشريك');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      isActive: true
    });
    setEditingPartner(null);
    setShowModal(false);
  };

  const movePartner = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = partners.findIndex(p => p._id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= partners.length) return;

    const newPartners = [...partners];
    [newPartners[currentIndex], newPartners[newIndex]] = [newPartners[newIndex], newPartners[currentIndex]];

    setPartners(newPartners);

    try {
      const partnersWithOrder = newPartners.map((partner, index) => ({
        id: partner._id,
        order: index
      }));
      
      await partnersApi.updatePartnersOrder(partnersWithOrder);
      toast.success('تم تحديث الترتيب بنجاح');
    } catch (error) {
      toast.error('خطأ في تحديث الترتيب');
      fetchPartners(); // Reset on error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة الشركاء</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gold hover:bg-gold-light text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          إضافة شريك جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الترتيب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الشريك
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners.map((partner, index) => (
                <tr key={partner._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => movePartner(partner._id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                      <button
                        onClick={() => movePartner(partner._id, 'down')}
                        disabled={index === partners.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={partner.logo}
                          alt={partner.name}
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/40x40?text=' + encodeURIComponent(partner.name);
                          }}
                        />
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      partner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {partner.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(partner)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(partner._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPartner ? 'تعديل الشريك' : 'إضافة شريك جديد'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الشريك
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="أدخل اسم الشريك"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    صورة الشعار
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData({ ...formData, logo: event.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                  {formData.logo && (
                    <div className="mt-2">
                      <img 
                        src={formData.logo} 
                        alt="معاينة الشعار" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="mr-2 block text-sm text-gray-900">
                    نشط
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-gold hover:bg-gold-light rounded-md"
                  >
                    {editingPartner ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartners;
