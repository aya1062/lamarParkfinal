const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Pricing = require('../models/Pricing');
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
    const properties = await Property.find(filter);

    // إذا لم تكن هناك عقارات، إنشاء عقار تجريبي
    if (properties.length === 0) {
      console.log('No properties found, creating sample property...');
      const sampleProperty = new Property({
        name: 'شاليه لامار بارك الفاخر',
        type: 'chalet',
        location: 'الرياض، المملكة العربية السعودية',
        price: 800,
        discountPrice: 650,
        rating: 4.8,
        reviewCount: 127,
        images: [
          '/lamar/chalet1/0C3A6982.jpg',
          '/lamar/chalet1/0C3A6994.JPG',
          '/lamar/chalet1/0C3A6997.JPG'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        features: ['مسبح خاص', 'مطبخ مجهز', 'حديقة خاصة', 'موقف سيارات'],
        amenities: [
          { title: 'مسبح خاص', body: 'مسبح خارجي مع إضاءة ليلية' },
          { title: 'مطبخ مجهز', body: 'مطبخ كامل مع جميع الأدوات' },
          { title: 'حديقة خاصة', body: 'حديقة واسعة مع منطقة جلوس' }
        ],
        description: 'شاليه فاخر في قلب الطبيعة مع إطلالة رائعة ومرافق متكاملة',
        available: true,
        status: 'active'
      });
      await sampleProperty.save();
      properties.push(sampleProperty);
    }

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
    const { name, type, location, price, discountPrice, amenities } = req.body;
    if (!name || !type || !location || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }
    // تحويل المرافق من JSON string إلى object
    let amenitiesArray = [];
    if (amenities) {
      try {
        amenitiesArray = JSON.parse(amenities);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid amenities format' });
      }
    }
    const property = new Property({ 
      ...req.body, 
      images, 
      discountPrice,
      amenities: amenitiesArray
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
    
    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    } else if (req.body.images) {
      updateData.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    
    // Handle images to be removed
    if (req.body.imagesToRemove) {
      try {
        const imagesToRemove = JSON.parse(req.body.imagesToRemove);
        
        if (Array.isArray(imagesToRemove) && imagesToRemove.length > 0) {
          // If we have new images, filter them with the ones to remove
          if (updateData.images) {
            updateData.images = updateData.images.filter(
              img => !imagesToRemove.includes(img)
            );
          }
          
          // Also remove from existing images in the database
          const existing = await Property.findById(req.params.id);
          
          if (existing && existing.images) {
            updateData.images = [
              ...(updateData.images || []),
              ...existing.images.filter(img => !imagesToRemove.includes(img))
            ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
          }
        }
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid imagesToRemove format',
          error: err.message
        });
      }
    }
    
    // Parse amenities if it's a string
    if (req.body.amenities) {
      if (typeof req.body.amenities === 'string') {
        try {
          updateData.amenities = JSON.parse(req.body.amenities);
        } catch (err) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid amenities format',
            error: err.message
          });
        }
      }
    }
    
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Property updated successfully', 
      property 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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
    const lastYearCount = await Property.countDocuments({ status: 'active', createdAt: { $gte: startOfLastYear, $lt: endOfLastYear } });

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

