import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Mail, Phone, Plus, Edit, Trash2, Shield, Crown, Lock, Calendar } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const AdminAccountManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUser, logout } = useAuthStore();

  const accounts = [
    {
      id: '1',
      name: 'أحمد محمد العلي',
      email: 'ahmed@email.com',
      phone: '+966 50 123 4567',
      role: 'customer',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-02-14',
      bookingsCount: 5,
      totalSpent: 12000,
      loyaltyPoints: 1250,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: '2',
      name: 'فاطمة علي السعيد',
      email: 'fatima@email.com',
      phone: '+966 55 987 6543',
      role: 'customer',
      status: 'active',
      joinDate: '2024-01-20',
      lastLogin: '2024-02-13',
      bookingsCount: 3,
      totalSpent: 7500,
      loyaltyPoints: 750,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: '3',
      name: 'محمد الخالد',
      email: 'mohammed@email.com',
      phone: '+966 56 456 7890',
      role: 'manager',
      status: 'active',
      joinDate: '2023-12-01',
      lastLogin: '2024-02-14',
      bookingsCount: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    }
  ];

  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    status: 'active'
  });

  // حالة بيانات التعديل
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // بدل تعريف viewMode ليكون متغير قابل للتغيير
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'manager': return 'مشرف';
      case 'customer': return 'عميل';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'manager': return Shield;
      case 'customer': return User;
      default: return User;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'نشط' : 'معطل';
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.register(newAccount);
    if (res.success && res.user) {
      setUsers([res.user, ...users]);
      setShowAddModal(false);
      setNewAccount({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        password: '',
        status: 'active'
      });
      toast.success('تمت إضافة الحساب بنجاح');
    } else {
      toast.error(res.message || 'فشل في إضافة الحساب');
    }
  };

  // عند الضغط على تعديل
  const handleEditAccount = (account: any) => {
    setSelectedUser(account);
    setEditForm({
      name: account.name || '',
      email: account.email || '',
      phone: account.phone || '',
      role: account.role || 'customer',
      status: account.status || 'active',
    });
    setShowEditModal(true);
  };

  // عند حفظ التعديلات
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setEditLoading(true);
    setEditError(null);
    const res = await api.updateUser((selectedUser as any)._id, editForm);
    if (res.success) {
      setUsers(users.map(u => (u._id === (selectedUser as any)._id ? { ...u, ...editForm } : u)));
      setShowEditModal(false);
      setSelectedUser(null);
      // إذا كان المستخدم يعدل نفسه
      if (user && ((user as any)._id === (selectedUser as any)._id || user.id === (selectedUser as any)._id)) {
        if (user.role !== editForm.role) {
          logout();
          window.location.href = '/login';
        } else {
          updateUser({ ...editForm, role: editForm.role as 'admin' | 'customer' | 'manager' });
        }
      }
      toast.success('تم تعديل بيانات الحساب بنجاح');
    } else {
      setEditError(res.message || 'فشل في تحديث المستخدم');
      toast.error(res.message || 'فشل في تحديث المستخدم');
    }
    setEditLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const res = await api.getAllUsers();
    if (res.success) {
      setUsers(res.data);
    } else {
      setError(res.message || 'فشل في جلب المستخدمين');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    const res = await api.deleteUser(id);
    if (res.success) {
      setUsers(users.filter(u => u._id !== id));
      toast.success('تم حذف الحساب بنجاح');
    } else {
      toast.error(res.message || 'فشل في حذف المستخدم');
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const res = await api.updateUserStatus(user._id, newStatus);
    if (res.success) {
      setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
    } else {
      alert(res.message || 'فشل في تحديث حالة المستخدم');
    }
  };

  const filteredAccounts = users.filter(account => {
    const matchesSearch = account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">إدارة الحسابات</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-gold flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="h-5 w-5" />
              <span>إضافة حساب جديد</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الحسابات</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الحسابات النشطة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">المديرون والمشرفون</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(a => a.role === 'admin' || a.role === 'manager').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gold bg-opacity-20 rounded-full">
                <Calendar className="h-6 w-6 text-gold" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">حسابات جديدة هذا الشهر</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(a => new Date(a.joinDate) > new Date('2024-02-01')).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الحسابات..."
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
              <option value="active">نشط</option>
              <option value="inactive">معطل</option>
            </select>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">
                {filteredAccounts.length} حساب
              </span>
            </div>
          </div>
        </div>

        {/* أضف أزرار التبديل أعلى الفلاتر */}
        <div className="flex justify-end mb-4">
          <button
            className={`px-4 py-2 rounded-l ${viewMode === 'table' ? 'bg-gold text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('table')}
          >
            جدول
          </button>
          <button
            className={`px-4 py-2 rounded-r ${viewMode === 'grid' ? 'bg-gold text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('grid')}
          >
            شبكة
          </button>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="py-3 px-4 text-right">الاسم</th>
                  <th className="py-3 px-4 text-right">البريد الإلكتروني</th>
                  <th className="py-3 px-4 text-right">رقم الهاتف</th>
                  <th className="py-3 px-4 text-right">الدور</th>
                  <th className="py-3 px-4 text-right">الحالة</th>
                  <th className="py-3 px-4 text-right">تاريخ الانضمام</th>
                  <th className="py-3 px-4 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <img
                        src={account.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(account.name)}
                        alt={account.name}
                        className="w-8 h-8 rounded-full object-cover ml-2"
                      />
                      {account.name}
                    </td>
                    <td className="py-3 px-4">{account.email}</td>
                    <td className="py-3 px-4">{account.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(account.role)}`}>
                        {getRoleText(account.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                        {getStatusText(account.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{account.joinDate ? new Date(account.joinDate).toLocaleDateString('ar-EG') : '--'}</td>
                    <td className="py-3 px-4 space-x-2 space-x-reverse flex">
                      <button
                        onClick={() => handleEditAccount(account)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center"
                      >
                        <Edit className="h-4 w-4 ml-1" />تعديل
                      </button>
                      <button
                        onClick={() => handleToggleStatus(account)}
                        className={`${account.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-1 rounded-lg transition-colors duration-300 flex items-center`}
                      >
                        <Lock className="h-4 w-4 ml-1" />{account.status === 'active' ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(account._id)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 ml-1" />حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account) => {
              const RoleIcon = getRoleIcon(account.role);
              return (
                <div key={account._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <img
                      src={account.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(account.name)}
                      alt={account.name}
                      className="w-16 h-16 rounded-full object-cover ml-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-600">{account.email}</p>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getRoleColor(account.role)}`}>
                        <RoleIcon className="h-3 w-3 ml-1" />
                        {getRoleText(account.role)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">الحالة:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>{getStatusText(account.status)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">تاريخ الانضمام:</span>
                      <span className="text-sm">{account.joinDate ? new Date(account.joinDate).toLocaleDateString('ar-EG') : '--'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">آخر دخول:</span>
                      <span className="text-sm">{account.lastLogin ? new Date(account.lastLogin).toLocaleDateString('ar-EG') : '--'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between space-x-2 space-x-reverse pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEditAccount(account)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 ml-1" />
                      <span className="text-sm">تعديل</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(account)}
                      className={`flex-1 ${account.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center`}
                    >
                      <Lock className="h-4 w-4 ml-1" />
                      <span className="text-sm">{account.status === 'active' ? 'تعطيل' : 'تفعيل'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(account._id)}
                      className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      <span className="text-sm">حذف</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">إضافة حساب جديد</h2>
            </div>
            
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل *</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  required
                  className="input-rtl"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                  required
                  className="input-rtl"
                  placeholder="user@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                <input
                  type="tel"
                  value={newAccount.phone}
                  onChange={(e) => setNewAccount({...newAccount, phone: e.target.value})}
                  required
                  className="input-rtl"
                  placeholder="+966 50 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدور *</label>
                <select
                  value={newAccount.role}
                  onChange={(e) => setNewAccount({...newAccount, role: e.target.value})}
                  className="input-rtl"
                >
                  <option value="customer">عميل</option>
                  <option value="manager">مشرف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور *</label>
                <input
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                  required
                  className="input-rtl"
                  placeholder="كلمة مرور قوية"
                />
              </div>

              <div className="flex items-center justify-end space-x-4 space-x-reverse pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-gold px-4 py-2"
                >
                  إضافة الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">تعديل الحساب</h2>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="input-rtl"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="input-rtl"
                  placeholder="user@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                  className="input-rtl"
                  placeholder="+966 50 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدور *</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="input-rtl"
                >
                  <option value="customer">عميل</option>
                  <option value="manager">مشرف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة *</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="input-rtl"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">معطل</option>
                </select>
              </div>
              {editError && <div className="text-red-500 text-sm">{editError}</div>}
              <div className="flex items-center justify-end space-x-4 space-x-reverse pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                  disabled={editLoading}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-gold px-4 py-2"
                  disabled={editLoading}
                >
                  {editLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountManagement; 