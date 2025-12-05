const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Pricing = require('../models/Pricing');
const Hotel = require('../models/Hotel');
// إضافة متطلبات cloudinary و multer
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Initialize Cloudinary if environment variables are set
let upload;

try {
  // Check if Cloudinary environment variables are set
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    console.log('Initializing Cloudinary with provided credentials');
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'lamar/properties',
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
    
    console.log('Cloudinary storage initialized successfully');
  } else {
    console.warn('Cloudinary credentials not found. Using memory storage as fallback.');
    // Fallback to memory storage if Cloudinary is not configured
    upload = multer({
      storage: multer.memoryStorage(),
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
  }
} catch (error) {
  console.error('Error initializing file upload:', error);
  // Fallback to memory storage on error
  upload = multer({ storage: multer.memoryStorage() });
}

exports.upload = upload;

exports.getAllProperties = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.featured !== undefined) filter.featured = req.query.featured === 'true';
    if (req.query.status) filter.status = req.query.status;
    if (req.query.hotel) filter.hotel = req.query.hotel;
    const properties = await Property.find(filter);

    // تم تعطيل إنشاء عقار تجريبي افتراضي. لتفعيله يدويًا استخدم المتغير التالي
    // if (properties.length === 0 && process.env.ENABLE_SAMPLE_PROPERTY === 'true') {
    //   ... إنشاء بيانات تجريبية ...
    // }

    // جلب سعر اليوم الحالي (أو أقرب يوم متاح) لكل عقار
    const today = new Date().toISOString().split('T')[0];
    const propertiesWithDiscount = await Promise.all(properties.map(async (property) => {
      // جلب تسعير اليوم الحالي
      const todayPricing = await Pricing.findOne({ property: property._id, date: today });
      let discountPrice = null;
      if (todayPricing && todayPricing.discountPrice && todayPricing.discountPrice < todayPricing.price) {
        discountPrice = todayPricing.discountPrice;
      } else if (property.discountPrice && property.discountPrice < property.price) {
        discountPrice = property.discountPrice;
      }
      return {
        ...property.toObject(),
        discountPrice
      };
    }));

    res.json({ success: true, properties: propertiesWithDiscount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    console.log('Getting property by ID:', req.params.id);
    const property = await Property.findById(req.params.id);
    console.log('Property found:', property ? 'Yes' : 'No');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    console.log('Sending response with data property');
    res.json({ success: true, data: property });
  } catch (err) {
    console.error('Error in getPropertyById:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const { name, type, location, price, discountPrice, amenities, hotel, chaletSettings, roomSettings } = req.body;
    if (!name || !type || !location || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // التحقق من علاقات الأب
    if (type === 'chalet' || type === 'room') {
      if (!hotel) {
        return res.status(400).json({ success: false, message: type === 'chalet' ? 'يجب اختيار المنتجع التابع له الشاليه' : 'يجب اختيار الفندق التابع له الغرفة' });
      }
      const parentHotel = await Hotel.findById(hotel);
      if (!parentHotel) {
        return res.status(404).json({ success: false, message: 'المنتجع/الفندق غير موجود' });
      }
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }

    // تحويل المرافق
    let amenitiesArray = [];
    if (amenities) {
      try {
        amenitiesArray = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid amenities format' });
      }
    }

    // إعدادات الشاليه
    let chaletSettingsObj = undefined;
    if (chaletSettings) {
      try {
        chaletSettingsObj = typeof chaletSettings === 'string' ? JSON.parse(chaletSettings) : chaletSettings;
      } catch (err) {
        return res.status(400).json({ success: false, message: 'تنسيق إعدادات الشاليه غير صحيح' });
      }
    }

    // إعدادات الغرفة (ستوك، مواصفات، تسعير)
    let roomSettingsObj = undefined;
    if (type === 'room') {
      try {
        roomSettingsObj = roomSettings ? (typeof roomSettings === 'string' ? JSON.parse(roomSettings) : roomSettings) : {};
      } catch (err) {
        return res.status(400).json({ success: false, message: 'تنسيق إعدادات الغرفة غير صحيح' });
      }
      // إعداد افتراضي للستوك لو لم يرسل
      if (!roomSettingsObj.availability) roomSettingsObj.availability = { isActive: true, totalUnits: 1, availableUnits: 1 };
      if (!roomSettingsObj.pricing) roomSettingsObj.pricing = { basePrice: Number(price) || 0, currency: 'SAR' };
    }

    const property = new Property({ 
      ...req.body, 
      images, 
      discountPrice,
      amenities: amenitiesArray,
      chaletSettings: chaletSettingsObj,
      roomSettings: roomSettingsObj
    });
    await property.save();
    res.status(201).json({ success: true, message: 'Property created successfully', property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    let updateData = { ...req.body };

    const existing = await Property.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const finalType = updateData.type || existing.type;
    if (finalType === 'chalet' || finalType === 'room') {
      const hotelId = updateData.hotel || existing.hotel;
      if (!hotelId) {
        return res.status(400).json({ success: false, message: finalType === 'chalet' ? 'يجب اختيار المنتجع التابع له الشاليه' : 'يجب اختيار الفندق التابع له الغرفة' });
      }
      const parentHotel = await Hotel.findById(hotelId);
      if (!parentHotel) {
        return res.status(404).json({ success: false, message: 'المنتجع/الفندق غير موجود' });
      }
      updateData.hotel = hotelId;
    }
    
    // الصور الجديدة
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    } else if (req.body.images) {
      updateData.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    
    // حذف صور
    if (req.body.imagesToRemove) {
      try {
        const imagesToRemove = JSON.parse(req.body.imagesToRemove);
        if (Array.isArray(imagesToRemove) && imagesToRemove.length > 0) {
          const existingDoc = await Property.findById(req.params.id);
          if (existingDoc && existingDoc.images) {
            updateData.images = [
              ...(updateData.images || []),
              ...existingDoc.images.filter(img => !imagesToRemove.includes(img))
            ].filter((v, i, a) => a.indexOf(v) === i);
          }
        }
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid imagesToRemove format' });
      }
    }
    
    // Parse amenities
    if (req.body.amenities) {
      if (typeof req.body.amenities === 'string') {
        try {
          updateData.amenities = JSON.parse(req.body.amenities);
        } catch (err) {
          return res.status(400).json({ success: false, message: 'Invalid amenities format' });
        }
      }
    }

    // Parse chaletSettings
    if (updateData.chaletSettings && typeof updateData.chaletSettings === 'string') {
      try {
        updateData.chaletSettings = JSON.parse(updateData.chaletSettings);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'تنسيق إعدادات الشاليه غير صحيح' });
      }
    }

    // Parse roomSettings
    if (updateData.roomSettings && typeof updateData.roomSettings === 'string') {
      try {
        updateData.roomSettings = JSON.parse(updateData.roomSettings);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'تنسيق إعدادات الغرفة غير صحيح' });
      }
    }
    
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    res.json({ success: true, message: 'Property updated successfully', property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const property = await Property.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, message: 'Property status updated', property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut } = req.body;
    
    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property ID, check-in and check-out dates are required' 
      });
    }

    // تحويل التواريخ إلى Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // التحقق من صحة التواريخ
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid date format' 
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Check-out date must be after check-in date' 
      });
    }

    // التحقق من وجود العقار
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    // التحقق من أن العقار نشط
    if (property.status === 'inactive') {
      return res.json({ 
        success: true, 
        data: { 
          available: false, 
          message: 'العقار غير متاح حالياً' 
        } 
      });
    }

    // البحث عن جميع الحجوزات للعقار (للتحقق)
    const allBookings = await Booking.find({ property: propertyId });
    console.log('All bookings for property:', allBookings.length);

    // البحث عن الحجوزات المتداخلة
    const conflictingBookings = await Booking.find({
      property: propertyId,
      status: { $in: ['confirmed'] }, // الحجوزات المؤكدة فقط
      $or: [
        // الحجوزات التي تبدأ قبل انتهاء الفترة المطلوبة وتنتهي بعد بدايتها
        {
          'dates.checkIn': { $lt: checkOutDate },
          'dates.checkOut': { $gt: checkInDate }
        }
      ]
    });

    console.log('Checking availability for:', {
      propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      conflictingBookings: conflictingBookings.length,
      conflictingBookingsDetails: conflictingBookings.map(b => ({
        id: b._id,
        checkIn: b.dates.checkIn,
        checkOut: b.dates.checkOut,
        status: b.status
      }))
    });

    const isAvailable = conflictingBookings.length === 0;

    res.json({ 
      success: true, 
      data: { 
        available: isAvailable,
        message: isAvailable ? 'العقار متاح في التواريخ المحددة' : 'العقار محجوز في التواريخ المحددة'
      } 
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// جلب عدد العقارات النشطة
exports.getActivePropertiesCount = async (req, res) => {
  try {
    const count = await Property.countDocuments({ status: 'active' });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// إحصائيات العقارات النشطة مع نسبة التغيير السنوي
exports.getActivePropertiesStats = async (req, res) => {
  try {
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;

    const startOfThisYear = new Date(thisYear, 0, 1);
    const endOfThisYear = new Date(thisYear + 1, 0, 1);
    const startOfLastYear = new Date(lastYear, 0, 1);
    const endOfLastYear = new Date(thisYear, 0, 1);

    // عد جميع العقارات النشطة بغض النظر عن تاريخ الإنشاء
    const thisYearCount = await Property.countDocuments({ status: 'active' });
    // عد العقارات النشطة التي أُنشئت السنة الماضية (للمقارنة فقط)
    const lastYearCount = await Property.countDocuments({ status: 'active', createdAt: { $gte: startOfLastYear, $lt: endOfThisYear } });

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

// Bulk assign all existing chalets to a specific hotel by name
exports.assignChaletsToHotelByName = async (req, res) => {
  try {
    const { hotelName } = req.body;
    if (!hotelName) {
      return res.status(400).json({ success: false, message: 'hotelName مطلوب' });
    }

    const hotel = await Hotel.findOne({ name: { $regex: new RegExp(hotelName, 'i') } });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'الفندق/المنتجع غير موجود' });
    }

    const query = { type: 'chalet', $or: [ { hotel: { $exists: false } }, { hotel: null }, { hotel: { $ne: hotel._id } } ] };
    const result = await Property.updateMany(query, { $set: { hotel: hotel._id } });

    res.json({ success: true, message: 'تم ربط الشاليهات بالمنتجع', hotel: { id: hotel._id, name: hotel.name }, matched: result.matchedCount ?? result.nMatched, modified: result.modifiedCount ?? result.nModified });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

