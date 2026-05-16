import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { FALLBACK_IMAGES } from '../../utils/imageFallback';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHotelsMenu, setShowHotelsMenu] = useState(false);
  const [showChaletsMenu, setShowChaletsMenu] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [chalets, setChalets] = useState<any[]>([]);
  const [quickLinks, setQuickLinks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    // Fetch Mega Menu items
    api.getHotels().then((res) => {
      if (res.success && res.data && res.data.hotels) {
        const list = res.data.hotels;
        if (Array.isArray(list)) {
          setHotels(list.filter((h: any) => h.type === 'hotel').slice(0, 6));
          setChalets(list.filter((h: any) => h.type === 'resort').slice(0, 6));
        }
      }
    }).catch(console.error);

    // Fetch Quick Links
    api.getQuickLinks(false).then((res) => {
      if (res.success && res.data?.links) {
        setQuickLinks(res.data.links);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const navItems = [
    { name: 'الرئيسية', path: '/' },
    { name: 'المنتجعات', path: '/resorts' },
    { name: 'الفنادق', path: '/hotels' },
    { name: 'خدمات', path: '/services', hasDropdown: true },
    { name: 'من نحن', path: '/about' },
    { name: 'تواصل معنا', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isQuickLinkActive = (path: string) => {
    // Exact match or active query parameter
    if (location.pathname + location.search === path) return true;
    if (path.includes('?') && location.search && location.search === path.substring(path.indexOf('?'))) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
    setShowUserMenu(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setIsSearchExpanded(false);
    }
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100/50 backdrop-blur-md bg-white/95">
      {/* 
        ========================================
        DESKTOP NAVBAR
        ========================================
      */}
      <div className="hidden lg:block max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 ml-8">
            <img 
              src="/lamar/new logo.png" 
              alt="لامار بارك" 
              className="h-16 w-auto object-contain transition-transform hover:scale-105"
              width={140}
              height={70}
              decoding="async"
            />
          </Link>

          {/* Main Navigation (Moved to Row 1) */}
          <div className="flex-1 flex justify-center items-center h-full mr-8 ml-8">
            <div className="flex space-x-8 space-x-reverse h-full">
              {navItems.map((item) => {
                const isHotels = item.path === '/hotels';
                const isChalets = item.path === '/resorts';
                return (
                  <div
                    key={item.path}
                    className="relative h-full flex items-center group"
                    onMouseEnter={() => {
                      if (isHotels) setShowHotelsMenu(true);
                      if (isChalets) setShowChaletsMenu(true);
                      if (item.path === '/services') setShowServicesMenu(true);
                    }}
                    onMouseLeave={() => {
                      if (isHotels) setShowHotelsMenu(false);
                      if (isChalets) setShowChaletsMenu(false);
                      if (item.path === '/services') setShowServicesMenu(false);
                    }}
                  >
                    {item.path === '/services' ? (
                      <button
                        type="button"
                        onClick={() => setShowServicesMenu((v) => !v)}
                        className={`relative px-2 py-2 text-[16px] font-semibold transition-colors duration-300 flex items-center gap-1 text-gray-600 hover:text-gold`}
                      >
                        {item.name}
                        <svg className="w-3.5 h-3.5 mt-0.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        className={`relative px-2 py-2 text-[16px] font-semibold transition-colors duration-300 ${
                          isActive(item.path)
                            ? 'text-gray-900'
                            : 'text-gray-600 hover:text-gold'
                        }`}
                      >
                        {item.name}
                        {isActive(item.path) && (
                          <span className="absolute bottom-4 left-0 right-0 h-0.5 bg-gold rounded-t-md" />
                        )}
                      </Link>
                    )}

                    {/* Mega Menu - Hotels */}
                    {isHotels && showHotelsMenu && (
                      <div className="absolute right-1/2 translate-x-1/2 top-full mt-0 pt-0 w-[500px] z-50">
                        <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-6 animate-fade-in relative mt-2">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                          
                          <div className="flex justify-between items-center mb-5 relative z-10">
                            <h3 className="text-lg font-bold text-gray-900">أشهر الفنادق</h3>
                            <Link to="/hotels" className="text-sm font-semibold text-gold hover:underline">عرض الكل</Link>
                          </div>
                          <div className="grid grid-cols-2 gap-4 relative z-10">
                            {hotels.length > 0 ? hotels.map((h) => {
                              const img = Array.isArray(h.images) && h.images.length
                                ? (typeof h.images[0] === 'string' ? h.images[0] : h.images[0]?.url)
                                : (h.image || FALLBACK_IMAGES.hotel);
                              return (
                                <Link key={h._id} to={`/hotel/${h._id}`} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-2xl transition-all group/item hover:scale-[1.02]">
                                  <img src={img} alt={h.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm group-hover/item:shadow-md transition-shadow" />
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate mb-0.5">{h.name}</h4>
                                    <p className="text-xs text-gray-500 truncate">{h.location}</p>
                                  </div>
                                </Link>
                              );
                            }) : (
                              <div className="col-span-2 py-6 text-center text-gray-400 text-sm">لا توجد فنادق حالياً</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mega Menu - Chalets */}
                    {isChalets && showChaletsMenu && (
                      <div className="absolute right-1/2 translate-x-1/2 top-full mt-0 pt-0 w-[500px] z-50">
                        <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-6 animate-fade-in relative mt-2">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>

                          <div className="flex justify-between items-center mb-5 relative z-10">
                            <h3 className="text-lg font-bold text-gray-900">أشهر المنتجعات والشاليهات</h3>
                            <Link to="/resorts" className="text-sm font-semibold text-gold hover:underline">عرض الكل</Link>
                          </div>
                          <div className="grid grid-cols-2 gap-4 relative z-10">
                            {chalets.length > 0 ? chalets.map((c) => {
                              const img = Array.isArray(c.images) && c.images.length
                                ? (typeof c.images[0] === 'string' ? c.images[0] : c.images[0]?.url)
                                : (c.image || FALLBACK_IMAGES.hotel);
                              return (
                                <Link key={c._id} to={`/resort/${c._id}`} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-2xl transition-all group/item hover:scale-[1.02]">
                                  <img src={img} alt={c.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm group-hover/item:shadow-md transition-shadow" />
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate mb-0.5">{c.name}</h4>
                                    <p className="text-xs text-gray-500 truncate">{c.location}</p>
                                  </div>
                                </Link>
                              );
                            }) : (
                              <div className="col-span-2 py-6 text-center text-gray-400 text-sm">لا توجد منتجعات حالياً</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Mega Menu - Services */}
                    {item.path === '/services' && showServicesMenu && (
                      <div className="absolute right-1/2 translate-x-1/2 top-full mt-0 pt-0 w-[240px] z-50">
                        <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] border border-gray-100 p-3 animate-fade-in relative mt-2">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                          <Link
                            to="/services/minibar"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all text-gray-700 hover:text-gold font-semibold text-sm"
                          >
                            🍹 ميني بار
                          </Link>
                          <Link
                            to="/services/digital-newspapers"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all text-gray-700 hover:text-gold font-semibold text-sm"
                          >
                            📰 الصحف الإلكترونية
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Menu & Search Icon */}
          <div className="flex-shrink-0 flex items-center gap-5 relative">
            {/* Search Toggle */}
            <div className="relative flex items-center justify-end" style={{ width: isSearchExpanded ? '300px' : '40px', transition: 'width 0.3s ease-in-out' }}>
              {isSearchExpanded ? (
                <form onSubmit={handleSearch} className="absolute right-0 w-[300px] flex items-center">
                  <div className="absolute right-4 text-gray-400"><Search className="h-4 w-4" /></div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث هنا..."
                    onBlur={() => {
                      if(!searchQuery) setIsSearchExpanded(false);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pr-10 pl-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold/50 shadow-sm"
                  />
                  {searchQuery && (
                    <button type="submit" className="absolute left-1.5 p-1.5 bg-gold text-white rounded-full hover:bg-gold-light transition-colors shadow-sm">
                      <Search className="h-4 w-4" />
                    </button>
                  )}
                </form>
              ) : (
                <button 
                  onClick={() => setIsSearchExpanded(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-gray-200 hover:shadow-md transition-all bg-white text-gray-700"
                >
                  <Menu className="h-4 w-4 text-gray-500" />
                  <div className="w-7 h-7 bg-gold/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gold" />
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in origin-top-left">
                    <div className="px-5 py-3 border-b border-gray-50 mb-2">
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>
                    {user?.role === 'customer' && <Link to="/dashboard" className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gold" onClick={() => setShowUserMenu(false)}>لوحة التحكم</Link>}
                    {user?.role === 'admin' && <Link to="/admin" className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gold" onClick={() => setShowUserMenu(false)}>لوحة الإدارة</Link>}
                    <button onClick={handleLogout} className="block w-full text-right px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">تسجيل الخروج</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-gold transition-colors px-2">دخول</Link>
                <Link to="/register" className="bg-gradient-to-r from-gold to-gold-light text-white rounded-full px-5 py-2 text-sm font-bold shadow-md hover:shadow-lg transition-all hover:brightness-110">إنشاء حساب</Link>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Quick Links Row (Desktop) */}
        {quickLinks.length > 0 && (
          <div className="border-t border-gray-50">
            <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide py-2.5 gap-8 items-center justify-center">
              {quickLinks.map((link) => (
                <Link
                  key={link._id}
                  to={link.path}
                  className={`relative py-1 text-sm font-bold tracking-wide transition-colors ${
                    isQuickLinkActive(link.path) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {link.name}
                  {isQuickLinkActive(link.path) && (
                    <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 
        ========================================
        MOBILE NAVBAR
        ========================================
      */}
      <div className="lg:hidden flex flex-col bg-white">
        {/* Row 1: Logo and Menu/User Icons */}
        <div className="flex justify-between items-center h-16 px-4">
          <Link to="/" className="flex-shrink-0">
            <img 
              src="/lamar/new logo.png" 
              alt="لامار بارك" 
              className="h-12 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gold" />
                </div>
              </button>
            ) : (
              <Link to="/login" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                <User className="h-5 w-5 text-gray-600" />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-gold transition-colors rounded-full hover:bg-gray-50"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Row 2: Search Bar */}
        <div className="px-4 pb-4">
          <form onSubmit={handleSearch} className="relative w-full shadow-sm rounded-full bg-gray-50 overflow-hidden flex items-center border border-gray-200 focus-within:border-gold/50 focus-within:ring-2 focus-within:ring-gold/20 focus-within:bg-white transition-all">
            <button type="submit" className="pl-4 pr-3 flex items-center justify-center h-full text-gray-400 hover:text-gold transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن الفنادق، الشاليهات..."
              className="w-full bg-transparent py-3.5 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none"
            />
          </form>
        </div>

        {/* Row 3: Dynamic Quick Links */}
        {quickLinks.length > 0 && (
          <div className="border-t border-gray-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]">
            <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide px-4 gap-6 items-center">
              {quickLinks.map((link) => (
                <Link
                  key={link._id}
                  to={link.path}
                  className={`relative py-4 text-sm font-bold tracking-wide transition-colors ${
                    isQuickLinkActive(link.path) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {link.name}
                  {isQuickLinkActive(link.path) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Slide-down Menu for User / Links when hamburger clicked */}
        {isOpen && (
          <div className="absolute top-[125px] left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-t border-gray-100 z-50 h-[calc(100vh-125px)] overflow-y-auto animate-fade-in">
            <div className="p-5 space-y-3">
              {navItems.map((item) => (
                item.path === '/services' ? (
                  <div key={item.path}>
                    <div className="px-5 py-3 text-base font-bold text-gray-700 border-b border-gray-50">
                      {item.name}
                    </div>
                    <Link
                      to="/services/minibar"
                      onClick={() => setIsOpen(false)}
                      className="block px-8 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gold rounded-xl transition-colors"
                    >
                      🍹 ميني بار
                    </Link>
                    <Link
                      to="/services/digital-newspapers"
                      onClick={() => setIsOpen(false)}
                      className="block px-8 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gold rounded-xl transition-colors"
                    >
                      📰 الصحف الإلكترونية
                    </Link>
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-5 py-4 text-base font-bold rounded-2xl transition-colors ${
                      isActive(item.path)
                        ? 'bg-gold/10 text-gold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gold'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              <div className="pt-6 mt-4 border-t border-gray-100">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="px-5 py-4 bg-gray-50 rounded-2xl mb-4 border border-gray-100">
                      <p className="text-base font-bold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                    </div>
                    
                    {user?.role === 'customer' && <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-5 py-4 text-base font-bold text-gray-700 hover:bg-gray-50 rounded-2xl">لوحة التحكم</Link>}
                    {user?.role === 'admin' && <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-5 py-4 text-base font-bold text-gray-700 hover:bg-gray-50 rounded-2xl">لوحة الإدارة</Link>}
                    
                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-right px-5 py-4 text-base font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors">تسجيل الخروج</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mt-2">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-5 py-4 text-base font-bold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">تسجيل الدخول</Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-5 py-4 text-base font-bold text-white bg-gradient-to-r from-gold to-gold-light rounded-2xl hover:brightness-110 transition-all shadow-md">إنشاء حساب</Link>
                  </div>
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