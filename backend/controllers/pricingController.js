const Pricing = require('../models/Pricing');

// جلب كل التسعيرات لعقار معين (مع فلتر تاريخ اختياري)
exports.getPricing = async (req, res) => {
  try {
    const filter = { property: req.query.propertyId };
    if (req.query.month) {
      // month: YYYY-MM
      filter.date = { $regex: `^${req.query.month}` };
    }
    const pricing = await Pricing.find(filter);
    res.json({ success: true, pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// حساب السعر الديناميكي حسب التواريخ
exports.calculatePrice = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut } = req.body;
    
    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({ 
        success: false, 
        message: 'جميع الحقول مطلوبة: propertyId, checkIn, checkOut' 
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'تواريخ غير صحيحة' 
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول' 
      });
    }

    // جلب العقار للحصول على السعر الأساسي
    const Property = require('../models/Property');
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'العقار غير موجود' 
      });
    }

    // حساب التواريخ في النطاق
    const datesInRange = [];
    const currentDate = new Date(checkInDate);
    while (currentDate < checkOutDate) {
      datesInRange.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // جلب التسعير للتواريخ المحددة
    const pricingData = await Pricing.find({
      property: propertyId,
      date: { $in: datesInRange }
    });

    // تحويل إلى map للوصول السريع
    const pricingMap = {};
    pricingData.forEach(item => {
      pricingMap[item.date] = item;
    });

    // حساب السعر الإجمالي
    let totalPrice = 0;
    let breakdown = [];
    let hasUnavailableDates = false;
    let unavailableDates = [];

    datesInRange.forEach(date => {
      const pricing = pricingMap[date];
      let dayPrice = property.price; // السعر الأساسي
      let discountApplied = false;

      if (pricing) {
        if (!pricing.available) {
          hasUnavailableDates = true;
          unavailableDates.push({
            date,
            reason: pricing.reason || 'غير متاح'
          });
        } else {
          // استخدام السعر المخفض إذا كان متاحاً وأقل من السعر الأساسي
          if (pricing.discountPrice && pricing.discountPrice < pricing.price) {
            dayPrice = pricing.discountPrice;
            discountApplied = true;
          } else if (pricing.price) {
            dayPrice = pricing.price;
          }
        }
      }

      totalPrice += dayPrice;
      breakdown.push({
        date,
        price: dayPrice,
        originalPrice: pricing?.price || property.price,
        discountApplied,
        available: pricing ? pricing.available : true
      });
    });

    const nights = datesInRange.length;
    const averagePricePerNight = totalPrice / nights;

    res.json({
      success: true,
      data: {
        propertyId,
        checkIn,
        checkOut,
        nights,
        totalPrice,
        averagePricePerNight,
        breakdown,
        hasUnavailableDates,
        unavailableDates,
        currency: 'SAR'
      }
    });

  } catch (err) {
    console.error('Error calculating price:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// إضافة تسعير جديد
exports.addPricing = async (req, res) => {
  try {
    const { property, date, price, available, reason } = req.body;
    const pricing = new Pricing({ property, date, price, available, reason });
    await pricing.save();
    res.status(201).json({ success: true, pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// تعديل تسعير
exports.updatePricing = async (req, res) => {
  try {
    console.log('updatePricing called:', req.params.id, req.body);
    const pricing = await Pricing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pricing) return res.status(404).json({ success: false, message: 'Pricing not found' });
    res.json({ success: true, pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// حذف تسعير
exports.deletePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndDelete(req.params.id);
    if (!pricing) return res.status(404).json({ success: false, message: 'Pricing not found' });
    res.json({ success: true, message: 'Pricing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 