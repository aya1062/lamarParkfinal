const RoomBooking = require('../models/RoomBooking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const User = require('../models/User');

// إنشاء حجز غرفة جديد
exports.createRoomBooking = async (req, res) => {
  try {
    const {
      guest, hotel, room, bookingDetails, specialRequests
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!guest || !hotel || !room || !bookingDetails) {
      return res.status(400).json({
        success: false,
        message: 'بيانات الضيف والفندق والغرفة وتفاصيل الحجز مطلوبة'
      });
    }

    // التحقق من وجود الفندق والغرفة
    const [hotelExists, roomExists] = await Promise.all([
      Hotel.findById(hotel),
      Room.findById(room)
    ]);

    if (!hotelExists) {
      return res.status(404).json({
        success: false,
        message: 'الفندق غير موجود'
      });
    }

    if (!roomExists) {
      return res.status(404).json({
        success: false,
        message: 'الغرفة غير موجودة'
      });
    }

    // التحقق من أن الغرفة تابعة للفندق
    if (roomExists.hotel.toString() !== hotel) {
      return res.status(400).json({
        success: false,
        message: 'الغرفة غير تابعة لهذا الفندق'
      });
    }

    // فحص توفر الغرفة
    const checkInDate = new Date(bookingDetails.checkIn);
    const checkOutDate = new Date(bookingDetails.checkOut);
    const roomCount = bookingDetails.roomCount || 1;

    const conflictingBookings = await RoomBooking.find({
      room: room,
      status: { $in: ['confirmed', 'checked_in'] },
      $or: [
        {
          'bookingDetails.checkIn': { $lt: checkOutDate },
          'bookingDetails.checkOut': { $gt: checkInDate }
        }
      ]
    });

    const bookedRooms = conflictingBookings.reduce((total, booking) => {
      return total + booking.bookingDetails.roomCount;
    }, 0);

    const availableRooms = roomExists.availability.availableRooms - bookedRooms;
    
    if (availableRooms < roomCount) {
      return res.status(400).json({
        success: false,
        message: 'الغرفة غير متاحة بالعدد المطلوب'
      });
    }

    // حساب التكلفة
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const basePrice = roomExists.pricing.basePrice * nights * roomCount;
    
    // حساب تكلفة الأشخاص الإضافيين
    const maxOccupancy = roomExists.specifications.maxOccupancy;
    const totalGuests = bookingDetails.adults + (bookingDetails.children || 0);
    const extraPersons = Math.max(0, totalGuests - maxOccupancy);
    const extraPersonPrice = extraPersons * roomExists.pricing.extraPersonPrice * nights;

    // حساب تكلفة الأسرّة الإضافية
    const extraBeds = bookingDetails.extraBeds || 0;
    const extraBedPrice = extraBeds * roomExists.pricing.extraBedPrice * nights;

    const totalAmount = basePrice + extraPersonPrice + extraBedPrice;

    // إنشاء الحجز
    const booking = new RoomBooking({
      guest,
      hotel,
      room,
      bookingDetails: {
        ...bookingDetails,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        roomCount
      },
      pricing: {
        basePrice,
        extraPersonPrice,
        extraBedPrice,
        totalAmount,
        currency: roomExists.pricing.currency
      },
      specialRequests
    });

    await booking.save();

    // تحديث رصيد الغرف
    await Room.findByIdAndUpdate(room, {
      $inc: { 'availability.availableRooms': -roomCount }
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحجز بنجاح',
      booking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// جلب جميع حجوزات الغرف
exports.getAllRoomBookings = async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.hotel) filter.hotel = req.query.hotel;
    if (req.query.room) filter.room = req.query.room;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.guestEmail) filter['guest.email'] = new RegExp(req.query.guestEmail, 'i');
    
    // فلترة بالتاريخ
    if (req.query.checkIn) {
      filter['bookingDetails.checkIn'] = { $gte: new Date(req.query.checkIn) };
    }
    if (req.query.checkOut) {
      filter['bookingDetails.checkOut'] = { $lte: new Date(req.query.checkOut) };
    }

    const bookings = await RoomBooking.find(filter)
      .populate('hotel', 'name type location')
      .populate('room', 'name type roomNumber')
      .populate('user', 'name email')
      .sort({ bookingDate: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// جلب حجز بالمعرف
exports.getRoomBookingById = async (req, res) => {
  try {
    const booking = await RoomBooking.findById(req.params.id)
      .populate('hotel', 'name type location address contact')
      .populate('room', 'name type roomNumber specifications amenities')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود'
      });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// تحديث حالة الحجز
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة غير صحيحة'
      });
    }

    const booking = await RoomBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود'
      });
    }

    // تحديث حالة الحجز
    booking.status = status;
    
    // إذا تم إلغاء الحجز، إرجاع الغرف للرصيد
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      await Room.findByIdAndUpdate(booking.room, {
        $inc: { 'availability.availableRooms': booking.bookingDetails.roomCount }
      });
      
      booking.cancellation = {
        cancelled: true,
        cancelledDate: new Date(),
        reason: req.body.cancellationReason || 'تم الإلغاء من قبل الإدارة'
      };
    }

    await booking.save();

    res.json({
      success: true,
      message: 'تم تحديث حالة الحجز',
      booking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// تسجيل الوصول
exports.checkIn = async (req, res) => {
  try {
    const booking = await RoomBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'يمكن تسجيل الوصول للحجوزات المؤكدة فقط'
      });
    }

    booking.status = 'checked_in';
    booking.checkInOut.checkInTime = new Date();
    booking.checkInOut.checkedInBy = req.user?.id;

    await booking.save();

    res.json({
      success: true,
      message: 'تم تسجيل الوصول بنجاح',
      booking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// تسجيل المغادرة
exports.checkOut = async (req, res) => {
  try {
    const booking = await RoomBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود'
      });
    }

    if (booking.status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'يمكن تسجيل المغادرة للضيوف المسجلين فقط'
      });
    }

    booking.status = 'checked_out';
    booking.checkInOut.checkOutTime = new Date();
    booking.checkInOut.checkedOutBy = req.user?.id;

    // إرجاع الغرف للرصيد
    await Room.findByIdAndUpdate(booking.room, {
      $inc: { 'availability.availableRooms': booking.bookingDetails.roomCount }
    });

    await booking.save();

    res.json({
      success: true,
      message: 'تم تسجيل المغادرة بنجاح',
      booking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// إلغاء الحجز
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await RoomBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود'
      });
    }

    if (!booking.canBeCancelled) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إلغاء هذا الحجز'
      });
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelled: true,
      cancelledDate: new Date(),
      reason: reason || 'تم الإلغاء من قبل الضيف'
    };

    // إرجاع الغرف للرصيد
    await Room.findByIdAndUpdate(booking.room, {
      $inc: { 'availability.availableRooms': booking.bookingDetails.roomCount }
    });

    await booking.save();

    res.json({
      success: true,
      message: 'تم إلغاء الحجز بنجاح',
      booking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// جلب إحصائيات الحجوزات
exports.getBookingStats = async (req, res) => {
  try {
    const { hotelId, roomId, period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999))
        };
        break;
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        dateFilter = { $gte: weekStart, $lt: weekEnd };
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        dateFilter = { $gte: monthStart, $lt: monthEnd };
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
        dateFilter = { $gte: yearStart, $lt: yearEnd };
        break;
    }

    const filter = { bookingDate: dateFilter };
    if (hotelId) filter.hotel = hotelId;
    if (roomId) filter.room = roomId;

    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      averageBookingValue
    ] = await Promise.all([
      RoomBooking.countDocuments(filter),
      RoomBooking.countDocuments({ ...filter, status: 'confirmed' }),
      RoomBooking.countDocuments({ ...filter, status: 'cancelled' }),
      RoomBooking.aggregate([
        { $match: { ...filter, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ]),
      RoomBooking.aggregate([
        { $match: { ...filter, status: 'confirmed' } },
        { $group: { _id: null, average: { $avg: '$pricing.totalAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageBookingValue: averageBookingValue[0]?.average || 0,
        period
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};















