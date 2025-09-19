import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
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

const HotelDetails: React.FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
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
                                p?.roomSettings?.specifications?.maxOccupancy ??
                                ((p?.roomSettings?.specifications?.maxAdults ?? 0) + (p?.roomSettings?.specifications?.maxChildren ?? 0)) ??
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

    const API_BASE = 'http://localhost:5000';
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
                                                        to={`/booking/${hotel._id}?room=${room._id}`}
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
