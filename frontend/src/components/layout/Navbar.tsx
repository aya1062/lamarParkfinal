import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHotelsMenu, setShowHotelsMenu] = useState(false);
  const [showChaletsMenu, setShowChaletsMenu] = useState(false); // يستخدم لقائمة المنتجعات
  const [hotels, setHotels] = useState<any[]>([]);
  const [chalets, setChalets] = useState<any[]>([]); // سيحمل المنتجعات
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    // جلب الفنادق والمنتجعات ثم فصلها حسب النوع (بدون فلترة الحالة لعرض الجميع)
    api.getHotels().then((res) => {
      const list = res?.data?.hotels || [];
      setHotels(list.filter((h: any) => h.type === 'hotel').slice(0, 6));
      setChalets(list.filter((h: any) => h.type === 'resort').slice(0, 6));
    });
  }, []);

  const navItems = [
    { name: 'الرئيسية', path: '/' },
    { name: 'المنتجعات', path: '/resorts' },
    { name: 'الفنادق', path: '/hotels' },
    // { name: 'حجز الغرف', path: '/room-booking' },
    { name: 'من نحن', path: '/about' },
    { name: 'تواصل معنا', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <img 
              src="/lamar/new logo.png" 
              alt="لامار بارك" 
              className="h-14 w-24 object-contain md:h-16 md:w-28"
              width={140}
              height={70}
              decoding="async"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => {
              const isHotels = item.path === '/hotels';
              const isChalets = item.path === '/resorts';
              return (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => {
                    if (isHotels) setShowHotelsMenu(true);
                    if (isChalets) setShowChaletsMenu(true);
                  }}
                  onMouseLeave={() => {
                    if (isHotels) setShowHotelsMenu(false);
                    if (isChalets) setShowChaletsMenu(false);
                  }}
                >
              <Link
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                  isActive(item.path)
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-gray-700 hover:text-gold'
                }`}
              >
                {item.name}
              </Link>

                  {isHotels && showHotelsMenu && (
                    <div className="absolute right-0 mt-3 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-fade-in">
                      <div className="text-sm font-semibold text-gray-900 mb-3 px-2">الفنادق</div>
                      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                        {hotels && hotels.length > 0 ? hotels.map((h) => {
                          const img = Array.isArray(h.images) && h.images.length
                            ? (typeof h.images[0] === 'string' ? h.images[0] : h.images[0]?.url)
                            : (h.image || 'https://via.placeholder.com/200x120?text=Hotel');
                          return (
                            <Link
                              key={h._id}
                              to={`/hotel/${h._id}`}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
                                >
                              <img src={img} alt={h.name} className="w-14 h-14 rounded object-cover flex-shrink-0" width={56} height={56} loading="lazy" decoding="async" />
                              <div className="min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-medium text-gray-900 text-sm truncate">{h.name}</h4>
                                  <span className="text-xs text-gold whitespace-nowrap">{h.rating || 0} ★</span>
                                </div>
                                <div className="text-xs text-gray-600 truncate">{h.location}</div>
                              </div>
                            </Link>
                          );
                        }) : (
                          <div className="py-6 text-center text-gray-600">لا توجد فنادق</div>
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <Link 
                          to="/hotels" 
                          onClick={() => setShowHotelsMenu(false)}
                          className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-gold text-white hover:bg-gold-light transition text-sm"
                        >
                          عرض كل الفنادق
                        </Link>
                      </div>
                    </div>
                  )}

                  {isChalets && showChaletsMenu && (
                    <div className="absolute right-0 mt-3 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-fade-in">
                      <div className="text-sm font-semibold text-gray-900 mb-3 px-2">المنتجعات</div>
                      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                        {chalets && chalets.length > 0 ? chalets.map((c) => {
                          const img = Array.isArray(c.images) && c.images.length
                            ? (typeof c.images[0] === 'string' ? c.images[0] : c.images[0]?.url)
                            : (c.image || 'https://via.placeholder.com/200x120?text=Resort');
                          return (
                            <Link
                              key={c._id}
                              to={`/resort/${c._id}`}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
                                >
                              <img src={img} alt={c.name} className="w-14 h-14 rounded object-cover flex-shrink-0" width={56} height={56} loading="lazy" decoding="async" />
                              <div className="min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-medium text-gray-900 text-sm truncate">{c.name}</h4>
                                  <span className="text-xs text-gold whitespace-nowrap">{c.rating || 0} ★</span>
                                </div>
                                <div className="text-xs text-gray-600 truncate">{c.location}</div>
                              </div>
                            </Link>
                          );
                        }) : (
                          <div className="py-6 text-center text-gray-600">لا توجد منتجعات</div>
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <Link 
                          to="/resorts" 
                          onClick={() => setShowChaletsMenu(false)}
                          className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-gold text-white hover:bg-gold-light transition text-sm"
                        >
                          عرض كل المنتجعات
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-4 space-x-reverse">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-gray-700 hover:text-gold transition-colors duration-300"
                >
                  <div className="w-8 h-8 bg-gold bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gold" />
                  </div>
                  <span>{user?.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    {user?.role === 'customer' && (
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        لوحة التحكم
                      </Link>
                    )}
                    
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        لوحة الإدارة
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-gray-700 hover:text-gold transition-colors duration-300"
                >
                  <User className="h-4 w-4" />
                  <span>تسجيل الدخول</span>
                </Link>
                <Link to="/register" className="btn-gold">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-gold"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-300 ${
                    isActive(item.path)
                      ? 'text-gold bg-gold bg-opacity-10'
                      : 'text-gray-700 hover:text-gold hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    {user?.role === 'customer' && (
                      <Link
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gold hover:bg-gray-50"
                      >
                        لوحة التحكم
                      </Link>
                    )}
                    
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gold hover:bg-gray-50"
                      >
                        لوحة الإدارة
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-right px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gold"
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block mt-2 btn-gold text-center"
                    >
                      إنشاء حساب
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;