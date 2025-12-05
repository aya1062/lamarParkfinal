import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { MapPin, Star, BedDouble, ChevronRight, ChevronLeft } from 'lucide-react';
import { api } from '../../utils/api';

interface Room {
	_id: string;
	name: string;
	description?: string;
	price: number;
	images?: string[];
	capacity?: number;
    city?: string;
}

// Inline WhatsApp icon to match brand identity
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
    >
        <path d="M20.52 3.48A11.78 11.78 0 0 0 12.03 0C5.48 0 .16 5.33.16 11.9c0 2.09.55 4.13 1.6 5.93L0 24l6.33-1.72a11.86 11.86 0 0 0 5.7 1.46h.01c6.55 0 11.87-5.33 11.87-11.9 0-3.18-1.24-6.17-3.39-8.36ZM12.04 21.3h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.75 1.02 1-3.66-.22-.38a9.3 9.3 0 0 1-1.4-4.86c0-5.16 4.19-9.36 9.37-9.36 2.5 0 4.86.98 6.64 2.76a9.34 9.34 0 0 1 2.74 6.63c0 5.16-4.2 9.4-9.43 9.4Zm5.4-7.02c-.3-.16-1.78-.88-2.06-.98-.28-.1-.49-.15-.7.15-.2.3-.8.98-.97 1.18-.18.2-.36.22-.66.06-.3-.16-1.26-.46-2.4-1.47-.89-.79-1.5-1.76-1.67-2.06-.18-.3-.02-.46.13-.6.13-.12.3-.32.46-.48.16-.16.2-.28.3-.48.1-.2.05-.36-.03-.5-.08-.16-.7-1.68-.96-2.3-.25-.6-.5-.52-.7-.53l-.6-.01c-.2 0-.5.07-.76.36-.26.3-1 1-1 2.44 0 1.44 1.03 2.83 1.18 3.02.15.2 2.03 3.17 4.92 4.44.69.3 1.24.48 1.66.62.7.22 1.33.19 1.83.12.56-.08 1.78-.73 2.03-1.44.25-.7.25-1.32.18-1.44-.07-.12-.27-.2-.57-.36Z" />
    </svg>
);

const HotelDetails: React.FC = () => {
    const { id } = useParams();
	const location = useLocation();
	const [hotel, setHotel] = useState<any>(null);
	const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [minCapacity, setMinCapacity] = useState<string>('');
    const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('price_asc');
    const [cityFilter, setCityFilter] = useState<string>('');
    const [currentSlide, setCurrentSlide] = useState<number>(0);

    useEffect(() => {
        const imgs: any[] = Array.isArray(hotel?.images) ? hotel.images : (hotel?.images ? [hotel.images] : []);
        if (!imgs || imgs.length <= 1) return;
        const id = window.setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % imgs.length);
        }, 5000);
        return () => window.clearInterval(id);
    }, [hotel]);

	useEffect(() => {
		if (!id) return;
		const load = async () => {
			setLoading(true);
			// احصل على الفندق/المنتجع
			const hotelRes = await api.getHotelById(id);
			if (hotelRes.success) {
				const h = hotelRes.data?.hotel || hotelRes.data;
				setHotel(h);
                setCurrentSlide(0);
                if (h?.type === 'hotel') {
                    const roomsRes = await api.getRoomsByHotel(id);
                    if (roomsRes.success && Array.isArray(roomsRes.data?.rooms) && roomsRes.data.rooms.length > 0) {
                        const mappedRooms = roomsRes.data.rooms.map((r: any) => ({
                            ...r,
                            city: h?.address?.city || undefined,
                            capacity: (r?.specifications?.maxOccupancy ?? ((r?.specifications?.maxAdults ?? 0) + (r?.specifications?.maxChildren ?? 0))) ?? undefined
                        }));
                        setRooms(mappedRooms);
                    } else {
                        // Fallback: some setups store hotel rooms in Properties with type 'room'
                        const propsRes = await api.getProperties({ type: 'room', hotel: id });
                        const propsRoomsRaw = Array.isArray(propsRes.data?.properties)
                            ? propsRes.data.properties
                            : Array.isArray(propsRes.data)
                            ? propsRes.data
                            : [];
                        const propsRooms = propsRoomsRaw.map((p: any) => ({
                            _id: p._id,
                            name: p.name,
                            description: p.description,
                            price: p?.roomSettings?.pricing?.basePrice ?? p.price ?? 0,
                            images: Array.isArray(p.images)
                                ? p.images.map((im: any) => (typeof im === 'string' ? im : im?.url)).filter(Boolean)
                                : [],
                            capacity:
                                (p?.roomSettings?.specifications?.maxOccupancy ??
                                ((p?.roomSettings?.specifications?.maxAdults ?? 0) + (p?.roomSettings?.specifications?.maxChildren ?? 0))) ??
                                p?.capacity ?? undefined,
                            city: h?.address?.city || undefined
                        }));
                        setRooms(propsRooms);
                    }
				} else if (h?.type === 'resort') {
					const chaletsRes = await api.getProperties({ type: 'chalet', hotel: id });
					const chalets = Array.isArray(chaletsRes.data?.properties)
						? chaletsRes.data.properties
						: Array.isArray(chaletsRes.data)
						? chaletsRes.data
						: [];
                    const mapped = chalets.map((c: any) => ({
						_id: c._id,
						name: c.name,
						description: c.description,
						price: c.price || c.basePrice || 0,
						images: Array.isArray(c.images) ? c.images.map((im: any) => (typeof im === 'string' ? im : im?.url)).filter(Boolean) : [],
                        capacity: c?.chaletSettings?.maxOccupancy || c.maxOccupancy || c.capacity || undefined,
                        city: (c.address?.city) || (typeof c.location === 'string' ? String(c.location).split('،')[0]?.trim() : undefined)
					}));
					setRooms(mapped);
				} else {
					setRooms([]);
				}
			} else {
				setHotel(null);
				setRooms([]);
			}
			setLoading(false);
		};
		load();
    }, [id]);

    const filteredRooms = useMemo(() => {
        let list = [...rooms];
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(r => (r.name || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q));
        }
        if (cityFilter) {
            list = list.filter(r => (r.city || '').toLowerCase() === cityFilter.toLowerCase());
        }
        const minP = minPrice !== '' ? Number(minPrice) : undefined;
        const maxP = maxPrice !== '' ? Number(maxPrice) : undefined;
        const minCap = minCapacity !== '' ? Number(minCapacity) : undefined;
        if (minP !== undefined) list = list.filter(r => (r.price ?? 0) >= minP);
        if (maxP !== undefined) list = list.filter(r => (r.price ?? 0) <= maxP);
        if (minCap !== undefined) list = list.filter(r => (r.capacity ?? 0) >= minCap);
        switch (sortBy) {
            case 'price_asc':
                list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
                break;
            case 'price_desc':
                list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
                break;
            case 'name_asc':
                list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'name_desc':
                list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
        }
        return list;
    }, [rooms, search, cityFilter, minPrice, maxPrice, minCapacity, sortBy]);

    const uniqueCities = useMemo(() => {
        const set = new Set<string>();
        rooms.forEach(r => { if (r.city) set.add(r.city); });
        return Array.from(set);
    }, [rooms]);

    const API_BASE = 'https://api.lamarparks.com';
    const absolutize = (url: string) => {
        if (!url) return url;
        if (/^https?:\/\//i.test(url)) return url;
        if (url.startsWith('/')) return API_BASE + url;
        return url;
    };

    const getFirstImageUrl = (images: any, fallback: string) => {
        if (!images) return fallback;
        const arr = Array.isArray(images) ? images : [images];
        if (arr.length === 0) return fallback;
        const first = arr[0];
        if (typeof first === 'string') return absolutize(first);
        if (first && typeof first === 'object' && (first as any).url) return absolutize((first as any).url as string);
        return absolutize(fallback);
    };

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-gray-600">جاري تحميل بيانات الفندق...</div>
			</div>
		);
	}

	if (!hotel) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">العنصر غير موجود</h2>
					<Link to={location.pathname.startsWith('/resort') ? '/resorts' : '/hotels'} className="btn-gold inline-flex items-center">
						<span>{location.pathname.startsWith('/resort') ? 'العودة لقائمة المنتجعات' : 'العودة لقائمة الفنادق'}</span>
						<ChevronRight className="h-4 w-4 mr-2" />
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with slider */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="relative h-80">
                        <div className="absolute inset-0">
                            {(Array.isArray(hotel?.images) ? hotel.images : [hotel?.images])
                              .filter(Boolean)
                              .slice(0, 10)
                              .map((img: any, index: number) => {
                                const url = getFirstImageUrl([img], 'https://placehold.co/1200x500?text=Hotel');
                                return (
                                  <img
                                    key={index}
                                    src={url}
                                    alt={hotel.name}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                                    width={1200}
                                    height={500}
                                    decoding="async"
                                  />
                                );
                              })}
                        </div>
                        {/* Controls */}
                        {Array.isArray(hotel?.images) && hotel.images.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setCurrentSlide(prev => {
                                const total = hotel.images.length;
                                return (prev - 1 + total) % total;
                              })}
                              className="absolute top-1/2 -translate-y-1/2 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
                              aria-label="السابق"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentSlide(prev => {
                                const total = hotel.images.length;
                                return (prev + 1) % total;
                              })}
                              className="absolute top-1/2 -translate-y-1/2 left-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
                              aria-label="التالي"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {hotel.images.map((_: any, i: number) => (
                                <span key={i} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-5 bg-gold' : 'w-2 bg-white/60'}`} />
                              ))}
                            </div>
                          </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                            <div className="text-white">
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">{hotel.name}</h1>
                                <div className="flex items-center text-white/90">
                                    <MapPin className="h-5 w-5 ml-2 text-gold" />
                                    <span>{hotel.location}</span>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white">
                                <Star className="h-5 w-5 text-gold fill-current ml-2" />
                                <span className="font-semibold">{hotel.rating || 0}</span>
                                <span className="mx-2">•</span>
                                <span>{hotel.reviewCount || 0} تقييم</span>
                    </div>
                    </div>
                </div>

                {/* Contact Information Banner */}
                <div className="bg-white rounded-2xl border border-gold/30 shadow-sm p-5 md:p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="flex items-center flex-wrap gap-4 md:gap-6">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gold/10">
                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gold text-white">
                                    <MapPin className="h-4 w-4" />
                                </span>
                                <div>
                                    <div className="text-xs text-gray-500">الموقع</div>
                                    {hotel?.contact?.mapsUrl ? (
                                        <a
                                            href={hotel.contact.mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold text-gold hover:underline"
                                        >
                                            {hotel.location}
                                        </a>
                                    ) : (
                                        <div className="font-semibold text-gray-900">{hotel.location}</div>
                                    )}
                                </div>
                            </div>
                            {(hotel?.contact?.whatsapp || hotel?.contact?.phone) && (
                                <a
                                    href={`https://wa.me/${(hotel.contact.whatsapp || hotel.contact.phone).replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/15 transition"
                                >
                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#25D366] text-white">
                                        <WhatsAppIcon className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <div className="text-xs text-gray-500">واتساب</div>
                                        <div className="font-semibold text-gray-900">{hotel.contact.whatsapp || hotel.contact.phone}</div>
                                    </div>
                                </a>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold/10">
                                <Star className="h-5 w-5 text-gold fill-current" />
                                <div className="font-bold text-gray-900 text-lg">{hotel.rating || 0}</div>
                                <span className="text-sm text-gray-500">تقييم</span>
                            </div>
                            {hotel?.contact?.whatsapp && (
                                <a
                                    href={`https://wa.me/${hotel.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                                >
                                    <span className="text-sm">واتساب</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact & Policies */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    {hotel?.contact && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">معلومات التواصل</h3>
                                <span className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-gold/10 text-gold">☎</span>
                            </div>
                            <div className="space-y-3">
                                {hotel.contact.phone && (
                                    <div className="flex items-center gap-3 text-gray-700 border-t border-gray-100 pt-3 first:border-none first:pt-0">
                                        <span className="text-[#25D366] text-xl"><WhatsAppIcon className="h-5 w-5" /></span>
                                        <a
                                            href={`https://wa.me/${hotel.contact.phone.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg font-medium text-gold hover:underline"
                                        >
                                            {hotel.contact.phone}
                                        </a>
                                    </div>
                                )}
                                {hotel.contact.email && (
                                    <div className="flex items-center gap-3 text-gray-700 border-t border-gray-100 pt-3">
                                        <span className="text-gold text-xl">✉️</span>
                                        <span className="text-lg font-medium">{hotel.contact.email}</span>
                                    </div>
                                )}
                                {hotel.contact?.mapsUrl && (
                                    <div className="flex items-center gap-3 text-gray-700 border-t border-gray-100 pt-3">
                                        <span className="text-gold text-xl">📍</span>
                                        <a
                                            href={hotel.contact.mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg font-medium text-gold hover:underline"
                                        >
                                            عرض على الخريطة
                                        </a>
                                    </div>
                                )}
                                {hotel.contact.whatsapp && (
                                    <div className="flex items-center gap-3 text-gray-700 border-t border-gray-100 pt-3">
                                        <span className="text-[#25D366] text-xl"><WhatsAppIcon className="h-5 w-5" /></span>
                                        <a
                                            href={`https://wa.me/${hotel.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg font-medium text-gold hover:underline"
                                        >
                                            {hotel.contact.whatsapp}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hotel Policies */}
                    {hotel?.policies && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">السياسات</h3>
                                <span className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-gold/10 text-gold">⚑</span>
                            </div>
                            <div className="space-y-3 text-gray-700">
                                {hotel.policies.checkIn && (
                                    <div className="flex justify-between border-t border-gray-100 pt-3 first:border-none first:pt-0">
                                        <span>تسجيل الوصول:</span>
                                        <span className="font-medium">{hotel.policies.checkIn}</span>
                                    </div>
                                )}
                                {hotel.policies.checkOut && (
                                    <div className="flex justify-between border-t border-gray-100 pt-3">
                                        <span>تسجيل المغادرة:</span>
                                        <span className="font-medium">{hotel.policies.checkOut}</span>
                                    </div>
                                )}
                            </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rooms/Chalets with sidebar layout 1:3 */}
                <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Listings (left) */}
                    <div className="md:col-span-3">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-2xl font-bold text-gray-900">{hotel?.type === 'resort' ? 'الشاليهات المتاحة' : 'الغرف المتاحة'}</h2>
                            <Link to={hotel?.type === 'resort' ? '/resorts' : '/hotels'} className="text-gold hover:underline">{hotel?.type === 'resort' ? 'كل المنتجعات' : 'كل الفنادق'}</Link>
                        </div>
                        {rooms.length === 0 ? (
                            <div className="p-6 bg-white rounded-xl shadow text-center text-gray-600">{hotel?.type === 'resort' ? 'لا توجد شاليهات متاحة حالياً' : 'لا توجد غرف متاحة حالياً'}</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRooms.map((room) => (
                                    <div key={room._id} className="bg-white rounded-xl shadow overflow-hidden group">
                                    <div className="relative h-48">
                                        <img
                                            src={getFirstImageUrl((room as any).images, 'https://placehold.co/600x400?text=Room')}
                                            alt={room.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition"
                                            width={600}
                                            height={192}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center">
                                            <BedDouble className="h-3.5 w-3.5 ml-1" />
                                            <span>سعة {room.capacity || 2}</span>
                                        </div>
                                    </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 mb-1">{room.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description || (hotel?.type === 'resort' ? 'شاليه مميز مزود بكل وسائل الراحة' : 'غرفة مميزة مزودة بكل وسائل الراحة')}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="text-gray-900 font-bold text-lg">
                                                    {room.price?.toLocaleString('ar-SA')} <span className="text-gray-600 text-sm">ريال/ليلة</span>
                                                </div>
                                                {hotel?.type === 'resort' ? (
                                                    <Link
                                                        to={`/property/${room._id}`}
                                                        className="btn-gold px-4 py-2"
                                                    >
                                                        عرض التفاصيل
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        to={`/room/${room._id}`}
                                                        className="btn-gold px-4 py-2"
                                                    >
                                                        عرض التفاصيل
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar filters (right) */}
                    <aside className="md:col-span-1 md:col-start-4">
                        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 sticky top-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">تصفية النتائج</h3>
                                <button
                                    onClick={() => { setSearch(''); setCityFilter(''); setMinPrice(''); setMaxPrice(''); setMinCapacity(''); setSortBy('price_asc'); }}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >مسح</button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">بحث</label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/30"
                                        placeholder={`ابحث باسم ${hotel?.type === 'resort' ? 'الشاليه' : 'الغرفة'}...`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">المدينة</label>
                                    <select
                                        value={cityFilter}
                                        onChange={(e) => setCityFilter(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
                                    >
                                        <option value="">الكل</option>
                                        {uniqueCities.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">أدنى سعر</label>
                                        <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/30" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">أعلى سعر</label>
                                        <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/30" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">أقل سعة</label>
                                    <input type="number" value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/30" />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">ترتيب</label>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold/30">
                                        <option value="price_asc">السعر: من الأقل للأعلى</option>
                                        <option value="price_desc">السعر: من الأعلى للأقل</option>
                                        <option value="name_asc">الاسم: أ-ي</option>
                                        <option value="name_desc">الاسم: ي-أ</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default HotelDetails;
