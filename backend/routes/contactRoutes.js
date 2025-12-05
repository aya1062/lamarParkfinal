const express = require('express');
const router = express.Router();

// إرسال رسالة اتصال
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'يرجى ملء جميع الحقول المطلوبة'
      });
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال بريد إلكتروني صحيح'
      });
    }

    // هنا يمكن إضافة منطق حفظ الرسالة في قاعدة البيانات
    // أو إرسالها عبر البريد الإلكتروني
    
    console.log('Contact message received:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً'
    });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى'
    });
  }
});

module.exports = router; 