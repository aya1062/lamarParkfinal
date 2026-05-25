const Hotel = require('../models/Hotel');
const Property = require('../models/Property');
const Room = require('../models/Room');
const RoomBooking = require('../models/RoomBooking');
const { filesFromField, parseInstallmentLogosJson } = require('../utils/uploadFields');
const {
  applyMapsCoordinatesToAddress,
  getHotelMapPosition,
  isMapsLikeUrl
} = require('../utils/mapsCoords');
const { createMulterUpload, uploadFilesToCloudinary } = require('../utils/createMulterUpload');

exports.upload = createMulterUpload({ folder: 'lamar/hotels' });

// جلب جميع الفنادق
exports.getAllHotels = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.featured !== undefined) filter.isFeatured = req.query.featured === 'true';
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { 'address.city': { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    } else if (req.query.city) {
      filter['address.city'] = new RegExp(req.query.city, 'i');
    }

    let hotels = await Hotel.find(filter)
      .populate('stats.totalRooms stats.totalChalets')
      .sort({ isFeatured: -1, createdAt: -1 });

    const forMap = req.query.forMap === '1' || req.query.forMap === 'true';
    if (forMap) {
      const enriched = await Promise.all(
        hotels.map(async (doc) => {
          const hotel = doc.toObject();
          const mapPosition = await getHotelMapPosition(hotel);
          return { ...hotel, mapPosition: mapPosition || null };
        })
      );
      hotels = enriched;
    } else {
      hotels = hotels.map((doc) => doc.toObject());
    }

    res.json({ success: true, hotels });
  } catch (err) {
    console.error('getAllHotels error:', err);
    res.status(500).json({ success: false, message: err?.message || 'Internal Server Error' });
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

    // جلب الغرف التابعة للفندق (سواء من جدول Room أو Property)
    const rooms = await Room.find({ 
      hotel: hotel._id, 
      status: 'active' 
    });

    const propertyRooms = await Property.find({
      hotel: hotel._id,
      type: 'room',
      status: 'active'
    });

    const mappedPropertyRooms = propertyRooms.map((p) => {
      const obj = p.toObject();
      return {
        ...obj,
        isProperty: true,
        specifications: obj.roomSettings?.specifications || {
          size: obj.chaletSettings?.size || 0,
          floor: obj.chaletSettings?.floor || 0,
          view: 'interior',
          bedType: 'double',
          maxOccupancy: obj.chaletSettings?.maxOccupancy || 2,
          maxAdults: obj.chaletSettings?.maxOccupancy || 2,
          maxChildren: 0
        },
        pricing: obj.roomSettings?.pricing || {
          basePrice: obj.price || 0,
          currency: 'SAR',
          extraPersonPrice: 0,
          extraBedPrice: 0
        },
        availability: obj.roomSettings?.availability || {
          isActive: true,
          totalRooms: 1,
          availableRooms: 1
        }
      };
    });

    const allRooms = [
      ...rooms.map(r => r.toObject()),
      ...mappedPropertyRooms
    ];

    res.json({ 
      success: true, 
      hotel: {
        ...hotel.toObject(),
        chalets,
        rooms: allRooms
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

    // معالجة الصور: رفع إلى Cloudinary والحصول على secure_url و public_id
    const imageFiles = filesFromField(req, 'images');
    let images = undefined;
    if (imageFiles.length > 0) {
      const cloudinaryResults = await uploadFilesToCloudinary(imageFiles, 'lamar/hotels');
      if (cloudinaryResults.length > 0) {
        images = cloudinaryResults.map((result, index) => ({
          url: result.secure_url,
          public_id: result.public_id,
          alt: `${name} - صورة ${index + 1}`,
          isMain: index === 0
        }));
      }
    }

    const installmentAvailable = req.body.installmentAvailable === true || req.body.installmentAvailable === 'true';
    const logoFiles = filesFromField(req, 'installmentLogoImages');
    const uploadedLogos = logoFiles.length > 0
      ? await uploadFilesToCloudinary(logoFiles, 'lamar/hotels/logos')
      : [];
    const installmentLogos = [
      ...parseInstallmentLogosJson(req.body.installmentLogos),
      ...uploadedLogos.map((result, index) => ({
        url: result.secure_url,
        public_id: result.public_id,
        alt: `شعار تقسيط ${index + 1}`
      }))
    ];

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

    let contactObj = {};
    if (contact) {
      try {
        contactObj = typeof contact === 'string' ? JSON.parse(contact) : contact;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'تنسيق بيانات التواصل غير صحيح'
        });
      }
    }
    if (!contactObj.mapsUrl && isMapsLikeUrl(location)) {
      contactObj.mapsUrl = String(location).trim();
    }
    addressObj = applyMapsCoordinatesToAddress(contactObj, addressObj);

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
      contact: contactObj,
      bookingSettings: bookingSettings ? (typeof bookingSettings === 'string' ? JSON.parse(bookingSettings) : bookingSettings) : {},
      installmentAvailable,
      installmentLogos
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

    const newLogoFiles = filesFromField(req, 'installmentLogoImages');

    // معالجة الصور الجديدة: رفع إلى Cloudinary
    const imageFiles = filesFromField(req, 'images');
    if (imageFiles.length > 0) {
      const cloudinaryResults = await uploadFilesToCloudinary(imageFiles, 'lamar/hotels');
      const newImages = cloudinaryResults.map((result, index) => ({
        url: result.secure_url,
        public_id: result.public_id,
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

    if (newLogoFiles.length > 0) {
      let baseLogos = [];
      if (updateData.installmentLogos !== undefined && updateData.installmentLogos !== null) {
        try {
          baseLogos = parseInstallmentLogosJson(
            typeof updateData.installmentLogos === 'string'
              ? updateData.installmentLogos
              : JSON.stringify(updateData.installmentLogos)
          );
        } catch {
          return res.status(400).json({
            success: false,
            message: 'تنسيق لوجوهات التقسيط غير صحيح'
          });
        }
      } else {
        const existingHotel = await Hotel.findById(req.params.id).select('installmentLogos');
        baseLogos = (existingHotel && existingHotel.installmentLogos) ? existingHotel.installmentLogos.map((x) => ({ url: x.url, alt: x.alt || '' })) : [];
      }
      const uploadedNewLogos = await uploadFilesToCloudinary(newLogoFiles, 'lamar/hotels/logos');
      const appended = uploadedNewLogos.map((result, index) => ({
        url: result.secure_url,
        public_id: result.public_id,
        alt: `شعار تقسيط ${index + 1}`
      }));
      updateData.installmentLogos = [...baseLogos, ...appended];
    }

    if (updateData.installmentAvailable !== undefined) {
      updateData.installmentAvailable = updateData.installmentAvailable === true || updateData.installmentAvailable === 'true';
    }

    // معالجة البيانات المعقدة
    for (const field of ['amenities', 'address', 'policies', 'contact', 'bookingSettings', 'instructions', 'installmentLogos']) {
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
    }

    if (updateData.contact !== undefined || updateData.address !== undefined) {
      const existingHotel = await Hotel.findById(req.params.id).select('address contact');
      const contactMerged = updateData.contact ?? (existingHotel?.contact?.toObject?.() ?? existingHotel?.contact ?? {});
      const addressMerged = updateData.address ?? (existingHotel?.address?.toObject?.() ?? existingHotel?.address ?? {});
      const loc = updateData.location ?? existingHotel?.location;
      if (!contactMerged.mapsUrl && isMapsLikeUrl(loc)) {
        contactMerged.mapsUrl = String(loc).trim();
      }
      const forceFromMapsUrl = !!(updateData.contact && updateData.contact.mapsUrl);
      updateData.address = applyMapsCoordinatesToAddress(contactMerged, addressMerged, { forceFromMapsUrl });
      if (contactMerged.mapsUrl) {
        updateData.contact = contactMerged;
      }
    }

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

