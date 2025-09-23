const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const RoomBooking = require('../models/RoomBooking');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Initialize Cloudinary for room images
let upload;

try {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'lamar/rooms',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
    });
    
    upload = multer({ 
      storage: storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('نوع الملف غير مدعوم. يرجى تحميل ملف صورة (JPEG, PNG, WebP)'));
        }
      }
    });
  } else {
    upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('نوع الملف غير مدعوم. يرجى تحميل ملف صورة (JPEG, PNG, WebP)'));
        }
      }
    });
  }
} catch (error) {
  console.error('Error initializing file upload:', error);
  upload = multer({ storage: multer.memoryStorage() });
}

exports.upload = upload;

// جلب جميع الغرف
exports.getAllRooms = async (req, res) => {
  try {
    const filter = {};
    if (req.query.hotel) filter.hotel = req.query.hotel;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.available !== undefined) {
      if (req.query.available === 'true') {
        filter['availability.isActive'] = true;
        filter['availability.availableRooms'] = { $gt: 0 };
      } else {
        filter.$or = [
          { 'availability.isActive': false },
          { 'availability.availableRooms': 0 }
        ];
      }
    }

    const rooms = await Room.find(filter)
      .populate('hotel', 'name type location')
      .sort({ 'management.priority': -1, createdAt: -1 });

    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// جلب غرفة بالمعرف
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel', 'name type location');
    if (!room) {
      return res.status(404).json({ success: false, message: 'الغرفة غير موجودة' });
    }

    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// إنشاء غرفة جديدة
exports.createRoom = async (req, res) => {
  try {
    const {
      hotel, roomNumber, name, type, description, specifications,
      amenities, pricing, availability
    } = req.body;

    if (!hotel || !roomNumber || !name || !type || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'الفندق، رقم الغرفة، الاسم، النوع والوصف مطلوبة' 
      });
    }

    // التحقق من وجود الفندق
    const hotelExists = await Hotel.findById(hotel);
    if (!hotelExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'الفندق غير موجود' 
      });
    }

    // التحقق من عدم تكرار رقم الغرفة في نفس الفندق
    const existingRoom = await Room.findOne({ 
      hotel: hotel, 
      roomNumber: roomNumber 
    });
    if (existingRoom) {
      return res.status(400).json({ 
        success: false, 
        message: 'رقم الغرفة موجود بالفعل في هذا الفندق' 
      });
    }

    // معالجة الصور
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        url: file.path,
        alt: `${name} - صورة ${index + 1}`,
        isMain: index === 0
      }));
    }

    // معالجة البيانات المعقدة
    let specificationsObj = {};
    if (specifications) {
      try {
        specificationsObj = typeof specifications === 'string' ? 
          JSON.parse(specifications) : specifications;
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: 'تنسيق مواصفات الغرفة غير صحيح' 
        });
      }
    }

    let amenitiesArray = [];
    if (amenities) {
      try {
        amenitiesArray = typeof amenities === 'string' ? 
          JSON.parse(amenities) : amenities;
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: 'تنسيق المرافق غير صحيح' 
        });
      }
    }

    let pricingObj = {};
    if (pricing) {
      try {
        pricingObj = typeof pricing === 'string' ? 
          JSON.parse(pricing) : pricing;
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: 'تنسيق التسعير غير صحيح' 
        });
      }
    }

    let availabilityObj = {};
    if (availability) {
      try {
        availabilityObj = typeof availability === 'string' ? 
          JSON.parse(availability) : availability;
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: 'تنسيق إعدادات التوفر غير صحيح' 
        });
      }
    }

    const room = new Room({
      hotel,
      roomNumber,
      name,
      type,
      description,
      images,
      specifications: specificationsObj,
      amenities: amenitiesArray,
      pricing: pricingObj,
      availability: availabilityObj
    });

    await room.save();

    // تحديث إحصائيات الفندق
    await Hotel.findByIdAndUpdate(hotel, {
      $inc: { 'stats.totalRooms': 1 }
    });

    res.status(201).json({ 
      success: true, 
      message: 'تم إنشاء الغرفة بنجاح', 
      room 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// تحديث غرفة
exports.updateRoom = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // معالجة الصور الجديدة
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        alt: `${req.body.name || 'غرفة'} - صورة ${index + 1}`,
        isMain: false
      }));
      
      if (updateData.images) {
        const existingImages = typeof updateData.images === 'string' ? 
          JSON.parse(updateData.images) : updateData.images;
        updateData.images = [...existingImages, ...newImages];
      } else {
        updateData.images = newImages;
      }
    }

    // معالجة البيانات المعقدة
    ['specifications', 'amenities', 'pricing', 'availability'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (err) {
          return res.status(400).json({ 
            success: false, 
            message: `تنسيق ${field} غير صحيح` 
          });
        }
      }
    });

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'الغرفة غير موجودة' 
      });
    }

    res.json({ 
      success: true, 
      message: 'تم تحديث الغرفة بنجاح', 
      room 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// حذف غرفة
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'الغرفة غير موجودة' 
      });
    }

    // التحقق من وجود حجوزات مرتبطة
    const bookings = await RoomBooking.countDocuments({ room: room._id });
    if (bookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف الغرفة لوجود حجوزات مرتبطة بها'
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    // تحديث إحصائيات الفندق
    await Hotel.findByIdAndUpdate(room.hotel, {
      $inc: { 'stats.totalRooms': -1 }
    });

    res.json({ 
      success: true, 
      message: 'تم حذف الغرفة بنجاح' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// تحديث رصيد الغرف
exports.updateRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { totalRooms, availableRooms, isActive } = req.body;

    if (totalRooms < 0 || availableRooms < 0) {
      return res.status(400).json({
        success: false,
        message: 'عدد الغرف يجب أن يكون أكبر من أو يساوي صفر'
      });
    }

    if (availableRooms > totalRooms) {
      return res.status(400).json({
        success: false,
        message: 'الغرف المتاحة لا يمكن أن تكون أكثر من العدد الإجمالي'
      });
    }

    const room = await Room.findByIdAndUpdate(
      roomId,
      {
        $set: {
          'availability.totalRooms': totalRooms,
          'availability.availableRooms': availableRooms,
          'availability.isActive': isActive,
          'management.lastUpdated': new Date()
        }
      },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'الغرفة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث رصيد الغرف بنجاح',
      room
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// فحص توفر الغرفة
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, roomCount = 1 } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'معرف الغرفة وتواريخ الحجز مطلوبة'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول'
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'الغرفة غير موجودة'
      });
    }

    if (!room.availability.isActive || room.status !== 'active') {
      return res.json({
        success: true,
        available: false,
        message: 'الغرفة غير متاحة حالياً'
      });
    }

    // فحص الحجوزات المتداخلة
    const conflictingBookings = await RoomBooking.find({
      room: roomId,
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

    const availableRooms = room.availability.availableRooms - bookedRooms;
    const isAvailable = availableRooms >= roomCount;

    res.json({
      success: true,
      available: isAvailable,
      availableRooms: Math.max(0, availableRooms),
      requestedRooms: roomCount,
      message: isAvailable ? 
        'الغرفة متاحة' : 
        'الغرفة غير متاحة بالعدد المطلوب'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// جلب إحصائيات الغرفة
exports.getRoomStats = async (req, res) => {
  try {
    const roomId = req.params.id;
    
    const [
      totalBookings,
      confirmedBookings,
      todayBookings,
      thisMonthBookings
    ] = await Promise.all([
      RoomBooking.countDocuments({ room: roomId }),
      RoomBooking.countDocuments({ room: roomId, status: 'confirmed' }),
      RoomBooking.countDocuments({ 
        room: roomId, 
        bookingDate: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      RoomBooking.countDocuments({ 
        room: roomId, 
        bookingDate: { 
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        confirmedBookings,
        todayBookings,
        thisMonthBookings
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};















