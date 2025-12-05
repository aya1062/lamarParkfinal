const Partner = require('../models/Partner');

// Get all active partners
const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: partners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الشركاء',
      error: error.message
    });
  }
};

// Get all partners (admin)
const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find()
      .sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: partners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الشركاء',
      error: error.message
    });
  }
};

// Get partner by ID
const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'الشريك غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: partner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الشريك',
      error: error.message
    });
  }
};

// Create new partner
const createPartner = async (req, res) => {
  try {
    const partnerData = { ...req.body };
    
    // If logoFile is provided (base64), use it as logo
    if (partnerData.logoFile) {
      partnerData.logo = partnerData.logoFile;
      delete partnerData.logoFile;
    }
    
    const partner = new Partner(partnerData);
    const savedPartner = await partner.save();
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء الشريك بنجاح',
      data: savedPartner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطأ في إنشاء الشريك',
      error: error.message
    });
  }
};

// Update partner
const updatePartner = async (req, res) => {
  try {
    const partnerData = { ...req.body };
    
    // If logoFile is provided (base64), use it as logo
    if (partnerData.logoFile) {
      partnerData.logo = partnerData.logoFile;
      delete partnerData.logoFile;
    }
    
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      partnerData,
      { new: true, runValidators: true }
    );
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'الشريك غير موجود'
      });
    }
    
    res.json({
      success: true,
      message: 'تم تحديث الشريك بنجاح',
      data: partner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث الشريك',
      error: error.message
    });
  }
};

// Delete partner
const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'الشريك غير موجود'
      });
    }
    
    res.json({
      success: true,
      message: 'تم حذف الشريك بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الشريك',
      error: error.message
    });
  }
};

// Update partner order
const updatePartnerOrder = async (req, res) => {
  try {
    const { partners } = req.body;
    
    if (!Array.isArray(partners)) {
      return res.status(400).json({
        success: false,
        message: 'يجب إرسال مصفوفة من الشركاء'
      });
    }
    
    const updatePromises = partners.map((partner, index) => 
      Partner.findByIdAndUpdate(partner.id, { order: index })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'تم تحديث ترتيب الشركاء بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث ترتيب الشركاء',
      error: error.message
    });
  }
};

module.exports = {
  getPartners,
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  updatePartnerOrder
};
