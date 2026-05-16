import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Link as LinkIcon, MoveUp, MoveDown } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminQuickLinks = () => {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    path: '',
    order: 0,
    isActive: true
  });

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await api.getQuickLinks(true); // get all including inactive
      if (res.success && res.data?.links) {
        setLinks(res.data.links);
      } else {
        toast.error('فشل في تحميل الروابط');
      }
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء تحميل الروابط');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData._id) {
        // Update
        const res = await api.updateQuickLink(formData._id, formData);
        if (res.success) {
          toast.success('تم تحديث الرابط بنجاح');
          setShowForm(false);
          fetchLinks();
        } else {
          toast.error(res.message || 'فشل في تحديث الرابط');
        }
      } else {
        // Create
        const { _id, ...data } = formData;
        const res = await api.createQuickLink({ ...data, order: links.length });
        if (res.success) {
          toast.success('تم إضافة الرابط بنجاح');
          setShowForm(false);
          fetchLinks();
        } else {
          toast.error(res.message || 'فشل في إضافة الرابط');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الرابط؟')) {
      try {
        const res = await api.deleteQuickLink(id);
        if (res.success) {
          toast.success('تم حذف الرابط بنجاح');
          fetchLinks();
        } else {
          toast.error(res.message || 'فشل في الحذف');
        }
      } catch (error) {
        console.error(error);
        toast.error('حدث خطأ');
      }
    }
  };

  const handleEdit = (link: any) => {
    setFormData({
      _id: link._id,
      name: link.name,
      path: link.path,
      order: link.order || 0,
      isActive: link.isActive
    });
    setShowForm(true);
  };

  const moveLink = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === links.length - 1)
    ) return;

    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    // Update state immediately for UX
    setLinks(newLinks);

    // Update order in DB
    try {
      await Promise.all([
        api.updateQuickLink(newLinks[index]._id, { order: index }),
        api.updateQuickLink(newLinks[targetIndex]._id, { order: targetIndex })
      ]);
    } catch (error) {
      console.error(error);
      toast.error('فشل في حفظ الترتيب');
      fetchLinks(); // revert on fail
    }
  };

  if (loading) {
    return <div className="p-8 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الروابط السريعة (شريط التنقل)</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة الأقسام والروابط التي تظهر في شريط التنقل (الصف الثالث)</p>
        </div>
        <button
          onClick={() => {
            setFormData({ _id: '', name: '', path: '', order: links.length, isActive: true });
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-light transition"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة رابط
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">{formData._id ? 'تعديل رابط' : 'إضافة رابط جديد'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الرابط (مثال: فنادق الرياض)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full input-rtl border-gray-300 rounded-lg shadow-sm focus:ring-gold focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المسار (مثال: /hotels?city=الرياض)</label>
                <input
                  type="text"
                  required
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  className="w-full input-rtl border-gray-300 rounded-lg shadow-sm focus:ring-gold focus:border-gold"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="mr-2 text-sm text-gray-700">
                نشط (يظهر في الموقع)
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-gold rounded-lg hover:bg-gold-light transition"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الترتيب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الرابط</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المسار</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {links.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    لا توجد روابط مضافة بعد.
                  </td>
                </tr>
              ) : (
                links.map((link, index) => (
                  <tr key={link._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveLink(index, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100 hover:text-gold'}`}
                        >
                          <MoveUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveLink(index, 'down')}
                          disabled={index === links.length - 1}
                          className={`p-1 rounded ${index === links.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100 hover:text-gold'}`}
                        >
                          <MoveDown className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <LinkIcon className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="font-medium text-gray-900">{link.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr">
                      {link.path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        link.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {link.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <div className="flex justify-end space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEdit(link)}
                          className="text-gold hover:text-gold-light"
                          title="تعديل"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(link._id)}
                          className="text-red-600 hover:text-red-900"
                          title="حذف"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminQuickLinks;
