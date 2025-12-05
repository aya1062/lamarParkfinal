const Hotel = require('../models/Hotel');
const Property = require('../models/Property');
const Room = require('../models/Room');
const RoomBooking = require('../models/RoomBooking');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Initialize Cloudinary for hotel images
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
        folder: 'lamar/hotels',
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

// جلب جميع الفنادق
exports.getAllHotels = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.featured !== undefined) filter.isFeatured = req.query.featured === 'true';
    if (req.query.city) filter['address.city'] = new RegExp(req.query.city, 'i');

    const hotels = await Hotel.find(filter)
      .populate('stats.totalRooms stats.totalChalets')
      .sort({ isFeatured: -1, createdAt: -1 });

    res.json({ success: true, hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// جلب فندق بالمعرف
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'الفندق غير موجود' });
    }

    // جلب الشاليهات التابعة للفندق
    const chalets = await Property.find({ 
      hotel: hotel._id, 
      type: 'chalet',
      status: 'active' 
    });

    // جلب الغرف التابعة للفندق
    const rooms = await Room.find({ 
      hotel: hotel._id, 
      status: 'active' 
    });

    res.json({ 
      success: true, 
      hotel: {
        ...hotel.toObject(),
        chalets,
        rooms
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// إنشاء فندق جديد
exports.createHotel = async (req, res) => {
  try {
    const {
      name, type, location, address, description, shortDescription,
      features, instructions, amenities, policies, contact, bookingSettings
    } = req.body;

    if (!name || !type || !location || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'الاسم، النوع، الموقع والوصف مطلوبة' 
      });
    }

    // معالجة الصور
    let images = undefined;
    if (req.files && req.files.length > 0) {
      const validFiles = req.files.filter((f) => !!f.path);
      if (validFiles.length > 0) {
        images = validFiles.map((file, index) => ({
        url: file.path,
        alt: `${name} - صورة ${index + 1}`,
        isMain: index === 0
      }));
      }
    }

    // معالجة البيانات المعقدة
    let amenitiesArray = [];
    if (amenities) {
      try {
        amenitiesArray = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: 'تنسيق المرافق غير صحيح' 
        });
      }
    }

    let addressObj = {};
    if (address) {
      try {
        addressObj = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: 'تنسيق العنوان غير صحيح' 
        });
      }
    }

    const hotel = new Hotel({
      name,
      type,
      location,
      address: addressObj,
      description,
      shortDescription,
      ...(images ? { images } : {}),
      features: features ? (typeof features === 'string' ? JSON.parse(features) : features) : [],
      instructions: instructions ? (typeof instructions === 'string' ? JSON.parse(instructions) : instructions) : [],
      amenities: amenitiesArray,
      policies: policies ? (typeof policies === 'string' ? JSON.parse(policies) : policies) : {},
      contact: contact ? (typeof contact === 'string' ? JSON.parse(contact) : contact) : {},
      bookingSettings: bookingSettings ? (typeof bookingSettings === 'string' ? JSON.parse(bookingSettings) : bookingSettings) : {}
    });

    await hotel.save();

    res.status(201).json({ 
      success: true, 
      message: 'تم إنشاء الفندق بنجاح', 
      hotel 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// تحديث فندق
exports.updateHotel = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // معالجة الصور الجديدة
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        alt: `${req.body.name || 'فندق'} - صورة ${index + 1}`,
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

    // معالجة الصور الموجودة
    if (updateData.images && typeof updateData.images === 'string') {
      try {
        updateData.images = JSON.parse(updateData.images);
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: 'تنسيق الصور غير صحيح' 
        });
      }
    }

    // معالجة البيانات المعقدة
    ['amenities', 'address', 'policies', 'contact', 'bookingSettings', 'instructions'].forEach(field => {
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

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({ 
        success: false, 
        message: 'الفندق غير موجود' 
      });
    }

    res.json({ 
      success: true, 
      message: 'تم تحديث الفندق بنجاح', 
      hotel 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// حذف فندق
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ 
        success: false, 
        message: 'الفندق غير موجود' 
      });
    }

    // التحقق من وجود حجوزات أو شاليهات مرتبطة
    const [chalets, rooms, bookings] = await Promise.all([
      Property.countDocuments({ hotel: hotel._id }),
      Room.countDocuments({ hotel: hotel._id }),
      RoomBooking.countDocuments({ hotel: hotel._id })
    ]);

    if (chalets > 0 || rooms > 0 || bookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف الفندق لوجود شاليهات أو غرف أو حجوزات مرتبطة به'
      });
    }

    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: 'تم حذف الفندق بنجاح' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// تحديث حالة الفندق
exports.updateHotelStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'حالة غير صحيحة' 
      });
    }

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({ 
        success: false, 
        message: 'الفندق غير موجود' 
      });
    }

    res.json({ 
      success: true, 
      message: 'تم تحديث حالة الفندق', 
      hotel 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// جلب إحصائيات الفندق
exports.getHotelStats = async (req, res) => {
  try {
    const hotelId = req.params.id;
    
    const [
      totalRooms,
      totalChalets,
      activeRooms,
      activeChalets,
      totalBookings,
      confirmedBookings,
      todayBookings
    ] = await Promise.all([
      Room.countDocuments({ hotel: hotelId }),
      Property.countDocuments({ hotel: hotelId, type: 'chalet' }),
      Room.countDocuments({ hotel: hotelId, status: 'active' }),
      Property.countDocuments({ hotel: hotelId, type: 'chalet', status: 'active' }),
      RoomBooking.countDocuments({ hotel: hotelId }),
      RoomBooking.countDocuments({ hotel: hotelId, status: 'confirmed' }),
      RoomBooking.countDocuments({ 
        hotel: hotelId, 
        bookingDate: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    const occupancyRate = totalRooms > 0 ? 
      ((totalRooms - activeRooms) / totalRooms) * 100 : 0;

    res.json({
      success: true,
      stats: {
        totalRooms,
        totalChalets,
        activeRooms,
        activeChalets,
        totalBookings,
        confirmedBookings,
        todayBookings,
        occupancyRate: Math.round(occupancyRate * 100) / 100
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

