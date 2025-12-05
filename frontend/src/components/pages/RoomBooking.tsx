import React, { useState, useEffect } from 'react';
import { Calendar, Users, Bed, DollarSign, Star, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';

interface Hotel {
  _id: string;
  name: string;
  type: string;
  location: string;
  address: {
    city: string;
    country: string;
  };
  description: string;
  images: Array<{
    url: string;
    alt: string;
    isMain: boolean;
  }>;
  rating: number;
  reviewCount: number;
  contact: {
    phone: string;
    email: string;
  };
}

interface Room {
  _id: string;
  roomNumber: string;
  name: string;
  type: string;
  description: string;
  images: Array<{
    url: string;
    alt: string;
    isMain: boolean;
  }>;
  specifications: {
    size: number;
    floor: number;
    view: string;
    bedType: string;
    maxOccupancy: number;
    maxAdults: number;
    maxChildren: number;
  };
  pricing: {
    basePrice: number;
    currency: string;
    extraPersonPrice: number;
    extraBedPrice: number;
  };
  availability: {
    isActive: boolean;
    totalRooms: number;
    availableRooms: number;
  };
  hotel: Hotel;
}

interface BookingForm {
  guest: {
    name: string;
    email: string;
    phone: string;
    nationality: string;
    idNumber: string;
  };
  bookingDetails: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    infants: number;
    roomCount: number;
    extraBeds: number;
  };
  specialRequests: string;
}

const RoomBooking: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Select Hotel, 2: Select Room, 3: Booking Form
  const [availability, setAvailability] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    guest: {
      name: '',
      email: '',
      phone: '',
      nationality: '',
      idNumber: ''
    },
    bookingDetails: {
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      infants: 0,
      roomCount: 1,
      extraBeds: 0
    },
    specialRequests: ''
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotel) {
      fetchRooms();
    }
  }, [selectedHotel]);

  const fetchHotels = async () => {
    try {
      const response = await fetch('https://api.lamarparks.com/api/hotels');
      const data = await response.json();
      if (data.success) {
        setHotels(data.hotels);
      }
    } catch (err) {
      setError('خطأ في جلب الفنادق');
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.lamarparks.com/api/rooms?hotel=${selectedHotel}`);
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      } else {
        setError(data.message || 'فشل في جلب الغرف');
      }
    } catch (err) {
      setError('خطأ في جلب الغرف');
    } finally {
      setLoading(false);
    }
  };

  const checkRoomAvailability = async (room: Room) => {
    if (!bookingForm.bookingDetails.checkIn || !bookingForm.bookingDetails.checkOut) {
      alert('يرجى اختيار تواريخ الحجز أولاً');
      return;
    }

    try {
      const response = await fetch('https://api.lamarparks.com/api/rooms/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: room._id,
          checkIn: bookingForm.bookingDetails.checkIn,
          checkOut: bookingForm.bookingDetails.checkOut,
          roomCount: bookingForm.bookingDetails.roomCount
        })
      });

      const data = await response.json();
      if (data.success) {
        setAvailability(data);
        if (data.available) {
          setSelectedRoom(room);
          setStep(3);
        } else {
          alert('الغرفة غير متاحة بالعدد المطلوب');
        }
      } else {
        alert(data.message || 'فشل في فحص التوفر');
      }
    } catch (err) {
      alert('خطأ في فحص التوفر');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      setLoading(true);
      const response = await fetch('https://api.lamarparks.com/api/room-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guest: bookingForm.guest,
          hotel: selectedRoom.hotel._id,
          room: selectedRoom._id,
          bookingDetails: bookingForm.bookingDetails,
          specialRequests: bookingForm.specialRequests
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('تم إنشاء الحجز بنجاح! رقم الحجز: ' + data.booking.bookingNumber);
        // Reset form
        setStep(1);
        setSelectedHotel('');
        setSelectedRoom(null);
        setBookingForm({
          guest: { name: '', email: '', phone: '', nationality: '', idNumber: '' },
          bookingDetails: { checkIn: '', checkOut: '', adults: 1, children: 0, infants: 0, roomCount: 1, extraBeds: 0 },
          specialRequests: ''
        });
      } else {
        alert(data.message || 'فشل في إنشاء الحجز');
      }
    } catch (err) {
      alert('خطأ في إنشاء الحجز');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom || !bookingForm.bookingDetails.checkIn || !bookingForm.bookingDetails.checkOut) return 0;
    
    const checkIn = new Date(bookingForm.bookingDetails.checkIn);
    const checkOut = new Date(bookingForm.bookingDetails.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const basePrice = selectedRoom.pricing.basePrice * nights * bookingForm.bookingDetails.roomCount;
    const totalGuests = bookingForm.bookingDetails.adults + bookingForm.bookingDetails.children;
    const extraPersons = Math.max(0, totalGuests - selectedRoom.specifications.maxOccupancy);
    const extraPersonPrice = extraPersons * selectedRoom.pricing.extraPersonPrice * nights;
    const extraBedPrice = bookingForm.bookingDetails.extraBeds * selectedRoom.pricing.extraBedPrice * nights;
    
    return basePrice + extraPersonPrice + extraBedPrice;
  };

  const getTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      'standard': 'عادي',
      'deluxe': 'مميز',
      'suite': 'جناح',
      'presidential': 'رئاسي',
      'family': 'عائلي',
      'executive': 'تنفيذي'
    };
    return types[type] || type;
  };

  const getBedTypeText = (bedType: string) => {
    const types: { [key: string]: string } = {
      'single': 'سرير فردي',
      'double': 'سرير مزدوج',
      'queen': 'سرير كوين',
      'king': 'سرير كينج',
      'twin': 'سريرين منفصلين',
      'sofa_bed': 'أريكة سرير'
    };
    return types[bedType] || bedType;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">حجز الغرف</h1>
          <p className="mt-2 text-gray-600">اختر فندقك وغرفتك المفضلة</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="mr-2 text-sm font-medium">اختيار الفندق</span>
            </div>
            <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="mr-2 text-sm font-medium">اختيار الغرفة</span>
            </div>
            <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="mr-2 text-sm font-medium">معلومات الحجز</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Hotel Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel._id}
                onClick={() => {
                  setSelectedHotel(hotel._id);
                  setStep(2);
                }}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img
                      src={hotel.images[0].url}
                      alt={hotel.images[0].alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">لا توجد صورة</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{hotel.location}</span>
                  </div>
                  <div className="flex items-center text-yellow-500 mb-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium mr-1">{hotel.rating}</span>
                    <span className="text-xs text-gray-500">({hotel.reviewCount})</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {hotel.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Room Selection */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← العودة لاختيار الفندق
              </button>
            </div>

            {/* Date Selection */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-semibold mb-4">تواريخ الحجز</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الوصول</label>
                  <input
                    type="date"
                    value={bookingForm.bookingDetails.checkIn}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      bookingDetails: { ...bookingForm.bookingDetails, checkIn: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ المغادرة</label>
                  <input
                    type="date"
                    value={bookingForm.bookingDetails.checkOut}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      bookingDetails: { ...bookingForm.bookingDetails, checkOut: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min={bookingForm.bookingDetails.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عدد البالغين</label>
                  <input
                    type="number"
                    min="1"
                    value={bookingForm.bookingDetails.adults}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      bookingDetails: { ...bookingForm.bookingDetails, adults: parseInt(e.target.value) }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عدد الأطفال</label>
                  <input
                    type="number"
                    min="0"
                    value={bookingForm.bookingDetails.children}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      bookingDetails: { ...bookingForm.bookingDetails, children: parseInt(e.target.value) }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عدد الغرف</label>
                  <input
                    type="number"
                    min="1"
                    value={bookingForm.bookingDetails.roomCount}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      bookingDetails: { ...bookingForm.bookingDetails, roomCount: parseInt(e.target.value) }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Rooms Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div key={room._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative h-48">
                      {room.images && room.images.length > 0 ? (
                        <img
                          src={room.images[0].url}
                          alt={room.images[0].alt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">لا توجد صورة</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.name}</h3>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">#{room.roomNumber}</span>
                        <span className="mx-1">•</span>
                        <span>{getTypeText(room.type)}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {room.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Bed className="w-4 h-4 mr-1" />
                          <span>{getBedTypeText(room.specifications.bedType)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{room.specifications.maxOccupancy} أشخاص</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-green-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-semibold">{room.pricing.basePrice}</span>
                          <span className="text-sm text-gray-500 mr-1">{room.pricing.currency}</span>
                          <span className="text-sm text-gray-500">/ ليلة</span>
                        </div>
                      </div>
                      <button
                        onClick={() => checkRoomAvailability(room)}
                        disabled={!bookingForm.bookingDetails.checkIn || !bookingForm.bookingDetails.checkOut}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        فحص التوفر
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Booking Form */}
        {step === 3 && selectedRoom && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setStep(2)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← العودة لاختيار الغرفة
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Selected Room Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">تفاصيل الحجز</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                      {selectedRoom.images && selectedRoom.images.length > 0 ? (
                        <img
                          src={selectedRoom.images[0].url}
                          alt={selectedRoom.images[0].alt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">لا توجد صورة</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{selectedRoom.name}</h4>
                      <p className="text-sm text-gray-600">#{selectedRoom.roomNumber}</p>
                      <p className="text-sm text-gray-600">{selectedRoom.hotel.name}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>تاريخ الوصول:</span>
                      <span>{new Date(bookingForm.bookingDetails.checkIn).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>تاريخ المغادرة:</span>
                      <span>{new Date(bookingForm.bookingDetails.checkOut).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>عدد الليالي:</span>
                      <span>{Math.ceil((new Date(bookingForm.bookingDetails.checkOut).getTime() - new Date(bookingForm.bookingDetails.checkIn).getTime()) / (1000 * 60 * 60 * 24))}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>عدد الغرف:</span>
                      <span>{bookingForm.bookingDetails.roomCount}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>عدد الضيوف:</span>
                      <span>{bookingForm.bookingDetails.adults + bookingForm.bookingDetails.children}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>المجموع:</span>
                        <span>{calculateTotalPrice()} {selectedRoom.pricing.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">معلومات الضيف</h3>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.guest.name}
                      onChange={(e) => setBookingForm({
                        ...bookingForm,
                        guest: { ...bookingForm.guest, name: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      required
                      value={bookingForm.guest.email}
                      onChange={(e) => setBookingForm({
                        ...bookingForm,
                        guest: { ...bookingForm.guest, email: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.guest.phone}
                      onChange={(e) => setBookingForm({
                        ...bookingForm,
                        guest: { ...bookingForm.guest, phone: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الجنسية</label>
                    <input
                      type="text"
                      value={bookingForm.guest.nationality}
                      onChange={(e) => setBookingForm({
                        ...bookingForm,
                        guest: { ...bookingForm.guest, nationality: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية</label>
                    <input
                      type="text"
                      value={bookingForm.guest.idNumber}
                      onChange={(e) => setBookingForm({
                        ...bookingForm,
                        guest: { ...bookingForm.guest, idNumber: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">طلبات خاصة</label>
                    <textarea
                      value={bookingForm.specialRequests}
                      onChange={(e) => setBookingForm({
                        ...bookingForm,
                        specialRequests: e.target.value
                      })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="أي طلبات خاصة أو ملاحظات..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'جاري إنشاء الحجز...' : 'تأكيد الحجز'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomBooking;

