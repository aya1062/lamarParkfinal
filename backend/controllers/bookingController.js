const Booking = require('../models/Booking');
const Pricing = require('../models/Pricing');

// التحقق من توفر العقار في التواريخ المطلوبة
const checkAvailability = async (propertyId, checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // التحقق من الحجوزات الموجودة
  const existingBookings = await Booking.find({
    property: propertyId,
    status: { $ne: 'cancelled' },
    $or: [
      {
        'dates.checkIn': { $lt: checkOutDate },
        'dates.checkOut': { $gt: checkInDate }
      }
    ]
  });
  
  if (existingBookings.length > 0) {
    return { available: false, reason: 'العقار محجوز في التواريخ المطلوبة' };
  }
  
  // التحقق من التسعير (إذا كان العقار غير متاح في أي يوم)
  const currentDate = new Date(checkInDate);
  while (currentDate < checkOutDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const pricing = await Pricing.findOne({
      property: propertyId,
      date: dateStr
    });
    
    if (pricing && !pricing.available) {
      return { available: false, reason: `العقار غير متاح في ${dateStr} - ${pricing.reason}` };
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return { available: true };
};

// تصدير الدالة لاستخدامها في controllers أخرى
exports.checkAvailability = checkAvailability;

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('property').populate('user');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property').populate('user');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user?.userId;
    console.log('createBooking: userId from token:', userId);
    console.log('createBooking: req.body:', req.body);
    // تحقق من الحقول المطلوبة يدويًا
    const requiredFields = [
      'property',
      'dates',
      'guests',
      'guest',
      'amount',
      'paymentMethod'
    ];
    const missing = requiredFields.filter(f => !req.body[f]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `الحقول التالية ناقصة: ${missing.join(', ')}`
      });
    }
    // تحقق من الحقول الداخلية
    if (!req.body.dates.checkIn || !req.body.dates.checkOut || req.body.dates.nights === undefined) {
      return res.status(400).json({
        success: false,
        message: 'تواريخ الحجز (checkIn, checkOut, nights) مطلوبة'
      });
    }
    if (!req.body.guest.name || !req.body.guest.email || !req.body.guest.phone) {
      return res.status(400).json({
        success: false,
        message: 'بيانات الضيف (name, email, phone) مطلوبة'
      });
    }
    // التحقق من التوفر
    const availability = await checkAvailability(
      req.body.property,
      req.body.dates.checkIn,
      req.body.dates.checkOut
    );
    if (!availability.available) {
      return res.status(400).json({ 
        success: false,
        message: availability.reason 
      });
    }
    // توافق: إذا وصلت قيمة غير مدعومة مثل 'arb'، حولها لقيمة مقبولة
    if (req.body.paymentMethod === 'arb') {
      req.body.paymentMethod = 'cash_on_arrival';
    }
    // تعيين user من التوكن
    const booking = new Booking({ ...req.body, user: userId });
    await booking.save();
    console.log('Booking saved successfully:', booking._id);
    // Populate property for the response
    const savedBooking = await Booking.findById(booking._id).populate('property');
    res.status(201).json({ success: true, booking: savedBooking });
  } catch (err) {
    console.error('Error in createBooking:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// إحصائيات الإيرادات السنوية (مجموع الإيرادات لكل شهر في السنة الحالية)
exports.getYearlyRevenueStats = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    // بداية ونهاية السنة
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    // جلب الحجوزات المؤكدة فقط
    const bookings = await Booking.find({
      status: 'confirmed',
      'dates.checkIn': { $gte: startOfYear, $lt: endOfYear }
    });

    // مصفوفة الإيرادات لكل شهر
    const monthlyRevenue = Array(12).fill(0);
    bookings.forEach(booking => {
      const month = new Date(booking.dates.checkIn).getMonth();
      monthlyRevenue[month] += booking.amount;
    });

    res.json({
      success: true,
      year,
      monthlyRevenue // مثال: [1200, 3000, 0, ...] لكل شهر
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// جلب أحدث 5 حجوزات
exports.getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ 'dates.checkIn': -1 })
      .limit(5)
      .populate('property')
      .populate('user');

    // تجهيز البيانات للعرض
    const result = bookings.map(b => ({
      id: b._id,
      guest: b.guest?.name || (b.user ? b.user.name : '---'),
      property: b.property?.name || '---',
      checkIn: b.dates.checkIn?.toISOString().split('T')[0] || '',
      amount: b.amount,
      status: b.status === 'confirmed' ? 'مؤكد' : b.status === 'pending' ? 'قيد المراجعة' : 'ملغي'
    }));

    res.json({ success: true, bookings: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// إحصائيات عدد الحجوزات لكل شهر في السنة الحالية
exports.getYearlyBookingStats = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const bookings = await Booking.find({
      'dates.checkIn': { $gte: startOfYear, $lt: endOfYear }
    });

    const monthlyBookings = Array(12).fill(0);
    bookings.forEach(booking => {
      const month = new Date(booking.dates.checkIn).getMonth();
      monthlyBookings[month] += 1;
    });

    res.json({
      success: true,
      year,
      monthlyBookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// إحصائيات إجمالي الحجوزات مع نسبة التغيير السنوي
exports.getTotalBookingsStats = async (req, res) => {
  try {
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;

    const startOfThisYear = new Date(thisYear, 0, 1);
    const endOfThisYear = new Date(thisYear + 1, 0, 1);
    const startOfLastYear = new Date(lastYear, 0, 1);
    const endOfLastYear = new Date(thisYear, 0, 1);

    const thisYearCount = await Booking.countDocuments({ 'dates.checkIn': { $gte: startOfThisYear, $lt: endOfThisYear } });
    const lastYearCount = await Booking.countDocuments({ 'dates.checkIn': { $gte: startOfLastYear, $lt: endOfLastYear } });

    let change = 0;
    let changeType = 'increase';
    if (lastYearCount > 0) {
      change = ((thisYearCount - lastYearCount) / lastYearCount) * 100;
      changeType = change >= 0 ? 'increase' : 'decrease';
    } else if (thisYearCount > 0) {
      change = 100;
      changeType = 'increase';
    }

    res.json({
      success: true,
      count: thisYearCount,
      change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      changeType
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// إحصائيات الإيرادات مع نسبة التغيير السنوي
exports.getTotalRevenueStats = async (req, res) => {
  try {
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;

    const startOfThisYear = new Date(thisYear, 0, 1);
    const endOfThisYear = new Date(thisYear + 1, 0, 1);
    const startOfLastYear = new Date(lastYear, 0, 1);
    const endOfLastYear = new Date(thisYear, 0, 1);

    const thisYearBookings = await Booking.find({ status: 'confirmed', 'dates.checkIn': { $gte: startOfThisYear, $lt: endOfThisYear } });
    const lastYearBookings = await Booking.find({ status: 'confirmed', 'dates.checkIn': { $gte: startOfLastYear, $lt: endOfLastYear } });

    const thisYearRevenue = thisYearBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const lastYearRevenue = lastYearBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

    let change = 0;
    let changeType = 'increase';
    if (lastYearRevenue > 0) {
      change = ((thisYearRevenue - lastYearRevenue) / lastYearRevenue) * 100;
      changeType = change >= 0 ? 'increase' : 'decrease';
    } else if (thisYearRevenue > 0) {
      change = 100;
      changeType = 'increase';
    }

    res.json({
      success: true,
      total: thisYearRevenue,
      change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      changeType
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// تحديث حالة الحجز فقط
exports.updateBookingStatus = async (req, res) => {
  try {
    console.log('BODY:', req.body); // تشخيص محتوى البودي
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = req.body.status;
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب حجوزات المستخدم الحالي
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.userId;
    console.log('userId from token:', userId);
    // في بيئة التطوير: لا تُرجع 401 لتجنب إعادة التوجيه القسرية للـ login
    if (!userId) {
      return res.json({ success: true, bookings: [] });
    }
    const bookings = await Booking.find({ user: userId }).populate('property');
    // تجهيز البيانات للفرونت
    const result = bookings.map(b => ({
      id: b._id,
      property: {
        name: b.property?.name || '',
        image: Array.isArray(b.property?.images) ? b.property.images[0] : '',
        location: b.property?.location || ''
      },
      dates: b.dates,
      guests: b.guests,
      amount: b.amount,
      status: b.status,
      paymentStatus: b.paymentStatus,
      bookingNumber: b.bookingNumber
    }));
    res.json({ success: true, bookings: result });
  } catch (err) {
    console.error('Error in getUserBookings:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getBookingByNumber = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingNumber: req.params.bookingNumber })
      .populate('property');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
