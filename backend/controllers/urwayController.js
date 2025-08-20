const axios = require('axios');
const crypto = require('crypto');

// إعداد متغيرات URWAY من env - استخدام Production مباشرة
const {
  URWAY_TERMINAL_ID_PROD,
  URWAY_PASSWORD_PROD,
  URWAY_SECRET_KEY_PROD
} = process.env;

// سجلات تشخيص
console.log('=== URWAY CONFIGURATION DEBUG ===');
console.log('URWAY_TERMINAL_ID_PROD:', URWAY_TERMINAL_ID_PROD ? 'SET' : 'NOT SET');
console.log('URWAY_PASSWORD_PROD:', URWAY_PASSWORD_PROD ? 'SET' : 'NOT SET');
console.log('URWAY_SECRET_KEY_PROD:', URWAY_SECRET_KEY_PROD ? 'SET' : 'NOT SET');

const URWAY_CONFIG = {
  terminalId: URWAY_TERMINAL_ID_PROD,
  password: URWAY_PASSWORD_PROD,
  secretKey: URWAY_SECRET_KEY_PROD,
  baseUrl: 'https://payments.urway-tech.com/URWAYPGService'  // Production URL
};

console.log('URWAY_CONFIG:', {
  terminalId: URWAY_CONFIG.terminalId ? 'SET' : 'NOT SET',
  password: URWAY_CONFIG.password ? 'SET' : 'NOT SET',
  secretKey: URWAY_CONFIG.secretKey ? 'SET' : 'NOT SET',
  baseUrl: URWAY_CONFIG.baseUrl
});
console.log('=== END URWAY CONFIGURATION DEBUG ===');

exports.createSession = async (req, res) => {
  try {
    const { amount, customerEmail, customerName, customerMobile, trackId, currency, udf1, udf2 } = req.body;
    
    console.log('URWAY Session Request:', {
      amount, customerEmail, customerName, customerMobile, trackId, currency
    });
    
    if (!amount || !customerEmail || !customerName || !customerMobile || !trackId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // التحقق من إعدادات URWAY
    if (!URWAY_CONFIG.terminalId || !URWAY_CONFIG.password || !URWAY_CONFIG.secretKey) {
      console.error('URWAY Configuration Error:', {
        terminalId: URWAY_CONFIG.terminalId ? 'Set' : 'Missing',
        password: URWAY_CONFIG.password ? 'Set' : 'Missing',
        secretKey: URWAY_CONFIG.secretKey ? 'Set' : 'Missing'
      });
      return res.status(500).json({ 
        message: 'URWAY configuration error - missing credentials',
        config: {
          terminalId: !!URWAY_CONFIG.terminalId,
          password: !!URWAY_CONFIG.password,
          secretKey: !!URWAY_CONFIG.secretKey
        }
      });
    }
    
    // إعداد بيانات URWAY حسب التوثيق الرسمي
    const data = {
      trackid: trackId,
      terminalId: URWAY_CONFIG.terminalId,
      action: "1", // Purchase - حسب التوثيق
      customerEmail: customerEmail,
      merchantIp: req.ip || req.connection.remoteAddress || '127.0.0.1',
      password: URWAY_CONFIG.password,
      currency: currency || 'SAR',
      amount: amount.toString(),
      country: 'SA',
      requestHash: '' // سيتم توليده
    };
    
    // إضافة الحقول الاختيارية إذا كانت متوفرة
    if (customerName) data.customerName = customerName;
    if (customerMobile) data.customerMobile = customerMobile;
    if (udf1) data.udf1 = udf1;
    if (udf2) data.udf2 = udf2;
    
    // توليد الـ hash حسب التوثيق الرسمي: trackid|TerminalId|password|secret_key|amount|currency
    const hashString = `${trackId}|${URWAY_CONFIG.terminalId}|${URWAY_CONFIG.password}|${URWAY_CONFIG.secretKey}|${amount}|${currency || 'SAR'}`;
    data.requestHash = crypto.createHash('sha256').update(hashString).digest('hex');
    
    console.log('URWAY Request Data:', {
      ...data,
      password: '***HIDDEN***',
      requestHash: data.requestHash.substring(0, 10) + '...'
    });
    
    // تشخيص إضافي
    console.log('URWAY Configuration Debug:', {
      terminalId: URWAY_CONFIG.terminalId,
      password: URWAY_CONFIG.password ? 'SET' : 'NOT SET',
      secretKey: URWAY_CONFIG.secretKey ? 'SET' : 'NOT SET',
      baseUrl: URWAY_CONFIG.baseUrl,
      hashString: `${trackId}|${URWAY_CONFIG.terminalId}|${URWAY_CONFIG.password}|${URWAY_CONFIG.secretKey}|${amount}|${currency || 'SAR'}`
    });
    
    // إرسال الطلب إلى URWAY
    console.log('=== SENDING REQUEST TO URWAY ===');
    console.log('URL:', `${URWAY_CONFIG.baseUrl}/transaction/jsonProcess/JSONrequest`);
    console.log('Data being sent:', JSON.stringify(data, null, 2));
    
    const urwayRes = await axios.post(`${URWAY_CONFIG.baseUrl}/transaction/jsonProcess/JSONrequest`, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000 // 30 seconds timeout
    });
    
    const urwayData = urwayRes.data;
    console.log('URWAY Response:', urwayData);
    
    if (urwayData && urwayData.targetUrl && urwayData.payid) {
      // Redirect to URWAY payment page
      const paymentUrl = `${urwayData.targetUrl}?paymentid=${urwayData.payid}`;
      
      return res.json({ 
        success: true,
        payid: urwayData.payid, 
        paymentUrl: paymentUrl,
        message: 'URWAY session created successfully'
      });
    } else {
      console.error('URWAY Error Response:', urwayData);
      return res.status(500).json({ 
        message: 'URWAY error', 
        urwayData,
        requestData: {
          trackId,
          amount,
          currency,
          terminalId: URWAY_CONFIG.terminalId
        }
      });
    }
  } catch (err) {
    console.error('URWAY Integration Error:', err);
    return res.status(500).json({ 
      message: 'URWAY integration error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// دالة فحص إعدادات URWAY
exports.checkUrwayConfig = async (req, res) => {
  try {
    const config = {
      environment: 'PRODUCTION',
      URWAY_TERMINAL_ID_PROD: URWAY_TERMINAL_ID_PROD ? 'SET' : 'NOT SET',
      URWAY_PASSWORD_PROD: URWAY_PASSWORD_PROD ? 'SET' : 'NOT SET',
      URWAY_SECRET_KEY_PROD: URWAY_SECRET_KEY_PROD ? 'SET' : 'NOT SET',
      URWAY_CONFIG: {
        terminalId: URWAY_CONFIG.terminalId ? 'SET' : 'NOT SET',
        password: URWAY_CONFIG.password ? 'SET' : 'NOT SET',
        secretKey: URWAY_CONFIG.secretKey ? 'SET' : 'NOT SET',
        baseUrl: URWAY_CONFIG.baseUrl,
        environment: 'PRODUCTION'
      },
      recommendation: 'Using PRODUCTION environment - make sure URWAY_*_PROD variables are set',
      debug: {
        terminalIdValue: URWAY_CONFIG.terminalId || 'NULL',
        passwordLength: URWAY_CONFIG.password ? URWAY_CONFIG.password.length : 0,
        secretKeyLength: URWAY_CONFIG.secretKey ? URWAY_CONFIG.secretKey.length : 0,
        envVars: {
          URWAY_TERMINAL_ID_PROD: URWAY_TERMINAL_ID_PROD || 'NULL',
          URWAY_PASSWORD_PROD: URWAY_PASSWORD_PROD ? 'SET' : 'NOT SET',
          URWAY_SECRET_KEY_PROD: URWAY_SECRET_KEY_PROD ? 'SET' : 'NOT SET'
        }
      }
    };
    
    res.json({
      success: true,
      config: config
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.handleCallback = async (req, res) => {
  try {
    // بيانات URWAY قد تأتي في body (POST) أو query (GET)
    const data = req.body && Object.keys(req.body).length > 0 ? req.body : req.query;
    const { 
      PaymentId, 
      TranId, 
      Result, 
      ResponseCode, 
      amount, 
      responseHash,
      TrackId,
      AuthCode,
      RRN,
      cardBrand,
      maskedPAN,
      paymentType,
      metaData
    } = data;
    
    console.log('URWAY Callback received:', data);
    
    if (!TrackId) {
      return res.status(400).json({ message: 'Missing TrackId' });
    }
    
    // التحقق من صحة الـ hash حسب التوثيق الرسمي
    // Hashsequence: TranId|Merchant secret key|ResponseCode|amount
    const calculatedHash = crypto.createHash('sha256')
      .update(`${TranId}|${URWAY_CONFIG.secretKey}|${ResponseCode}|${amount}`)
      .digest('hex');
    
    console.log('Hash verification:', {
      received: responseHash,
      calculated: calculatedHash,
      match: calculatedHash === responseHash
    });
    
    // التحقق من صحة الـ hash والنتيجة
    if (calculatedHash === responseHash && Result && Result.toLowerCase() === 'successful') {
      // البحث عن الحجز المرتبط بـ TrackId
      try {
        const Booking = require('../models/Booking');
        const booking = await Booking.findOne({ 
          $or: [
            { bookingNumber: TrackId },
            { 'payment.transactionId': TranId }
          ]
        });
        
        if (booking) {
          // تحديث حالة الحجز
          booking.status = 'confirmed';
          booking.paymentStatus = 'paid';
          booking.paymentMethod = 'urway';
          booking.payment = {
            transactionId: TranId,
            amount: amount,
            status: 'paid',
            paymentDate: new Date(),
            authCode: AuthCode,
            rrn: RRN,
            cardBrand: cardBrand,
            maskedPAN: maskedPAN,
            paymentType: paymentType
          };
          await booking.save();
          
          console.log('Booking updated successfully:', booking._id);
        }
      } catch (err) {
        console.error('Error updating booking:', err);
      }
      
      return res.json({ 
        success: true, 
        message: 'Payment confirmed successfully', 
        transactionId: TranId,
        amount: amount,
        trackId: TrackId,
        responseCode: ResponseCode
      });
    } else {
      // إذا فشل الدفع أو hash غير صحيح
      console.error('Payment failed or hash mismatch:', {
        result: Result,
        responseCode: ResponseCode,
        hashMatch: calculatedHash === responseHash
      });
      
      return res.json({ 
        success: false, 
        message: 'Payment failed or invalid response', 
        result: Result,
        responseCode: ResponseCode,
        trackId: TrackId
      });
    }
  } catch (err) {
    console.error('URWAY callback error:', err);
    return res.status(500).json({ message: 'URWAY callback error', error: err.message });
  }
};

// دالة استعلام المعاملات حسب التوثيق الرسمي
exports.inquiryTransaction = async (req, res) => {
  try {
    const { transId, trackId, amount, currency, udf1 } = req.body;
    
    if (!transId || !trackId || !amount) {
      return res.status(400).json({ message: 'Missing required fields: transId, trackId, amount' });
    }
    
    // التحقق من إعدادات URWAY
    if (!URWAY_CONFIG.terminalId || !URWAY_CONFIG.password || !URWAY_CONFIG.secretKey) {
      return res.status(500).json({ 
        message: 'URWAY configuration error - missing credentials'
      });
    }
    
    // إعداد بيانات الاستعلام حسب التوثيق الرسمي
    const data = {
      transid: transId,
      trackid: trackId,
      terminalId: URWAY_CONFIG.terminalId,
      action: "10", // Transaction Inquiry
      merchantIp: req.ip || req.connection.remoteAddress || '127.0.0.1',
      password: URWAY_CONFIG.password,
      currency: currency || 'SAR',
      amount: amount.toString(),
      requestHash: '' // سيتم توليده
    };
    
    // إضافة udf1 إذا كان متوفر
    if (udf1) data.udf1 = udf1;
    
    // توليد الـ hash حسب التوثيق الرسمي
    const hashString = `${trackId}|${URWAY_CONFIG.terminalId}|${URWAY_CONFIG.password}|${URWAY_CONFIG.secretKey}|${amount}|${currency || 'SAR'}`;
    data.requestHash = crypto.createHash('sha256').update(hashString).digest('hex');
    
    console.log('URWAY Inquiry Request:', {
      ...data,
      password: '***HIDDEN***',
      requestHash: data.requestHash.substring(0, 10) + '...'
    });
    
    // إرسال طلب الاستعلام إلى URWAY
    const urwayRes = await axios.post(`${URWAY_CONFIG.baseUrl}/transaction/jsonProcess/JSONrequest`, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    const urwayData = urwayRes.data;
    console.log('URWAY Inquiry Response:', urwayData);
    
    if (urwayData && urwayData.result) {
      return res.json({
        success: true,
        result: urwayData.result,
        responseCode: urwayData.responseCode,
        transactionId: urwayData.tranid,
        trackId: urwayData.trackid,
        amount: urwayData.amount,
        authCode: urwayData.authcode,
        rrn: urwayData.rrn,
        cardBrand: urwayData.cardBrand,
        maskedPAN: urwayData.maskedPAN,
        paymentType: urwayData.paymentType,
        transactionDate: urwayData.trandate
      });
    } else {
      return res.status(500).json({
        message: 'URWAY inquiry failed',
        urwayData
      });
    }
  } catch (err) {
    console.error('URWAY Inquiry Error:', err);
    return res.status(500).json({
      message: 'URWAY inquiry error',
      error: err.message
    });
  }
}; 