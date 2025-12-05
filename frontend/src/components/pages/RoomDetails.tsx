import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BedDouble, Users, MapPin, ChevronRight } from 'lucide-react';
import { api } from '../../utils/api';

const RoomDetails: React.FC = () => {
    const { id } = useParams();
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.getRoomById(id).then(res => {
            if (res.success) {
                setRoom((res as any).data?.room || (res as any).data);
            } else {
                setRoom(null);
            }
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">جاري تحميل بيانات الغرفة...</div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">الغرفة غير موجودة</h2>
                    <Link to="/hotels" className="btn-gold inline-flex items-center">
                        <span>العودة لقائمة الفنادق</span>
                        <ChevronRight className="h-4 w-4 mr-2" />
                    </Link>
                </div>
            </div>
        );
    }

    const hotel = (room as any).hotel || {};

    const API_BASE = 'https://api.lamarparks.com';
    const absolutize = (url: string) => {
        if (!url) return url;
        if (/^https?:\/\//i.test(url)) return url;
        if (url.startsWith('/')) return API_BASE + url;
        return url;
    };

    const images: any[] = Array.isArray(room.images) ? room.images : [];
    const firstImage = images[0]?.url || images[0] || 'https://placehold.co/1200x500?text=Room';

    return (
        <div className="min-h-screen bg-gray-50 pt-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="relative h-72">
                        <img src={absolutize(firstImage)} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                            <div className="text-white">
                                <h1 className="text-2xl md:text-3xl font-bold mb-1">{room.name}</h1>
                                <div className="flex items-center text-white/90">
                                    <MapPin className="h-5 w-5 ml-2 text-gold" />
                                    <span>{hotel?.name || ''} • {hotel?.location || ''}</span>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-white">
                                <span className="font-semibold">{room.pricing?.basePrice || room.price || 0}</span>
                                <span className="ml-1">ريال/ليلة</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">الوصف</h3>
                            <p className="text-gray-700 leading-relaxed">{room.description || 'غرفة مريحة مزودة بكل وسائل الراحة'}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">المواصفات</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                                <div className="flex items-center"><BedDouble className="h-4 w-4 ml-2 text-gold" /> نوع السرير: {room.specifications?.bedType || 'غير محدد'}</div>
                                <div className="flex items-center"><Users className="h-4 w-4 ml-2 text-gold" /> السعة: {room.specifications?.maxOccupancy || room.capacity || 2}</div>
                                {typeof room.specifications?.size === 'number' && (<div>المساحة: {room.specifications.size} م²</div>)}
                                {room.specifications?.view && (<div>الإطلالة: {room.specifications.view}</div>)}
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="bg-white rounded-xl shadow p-6">
                            <div className="text-gray-600 mb-1">السعر</div>
                            <div className="text-3xl font-bold text-gray-900">
                                {(room.pricing?.basePrice || room.price || 0).toLocaleString('ar-SA')} <span className="text-base text-gray-600">ريال/ليلة</span>
                            </div>
                            <Link to={`/room-booking?hotel=${hotel?._id || hotel?.id || ''}`} className="btn-gold mt-4 inline-flex items-center justify-center w-full px-4 py-3">
                                ابدأ الحجز
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default RoomDetails;


