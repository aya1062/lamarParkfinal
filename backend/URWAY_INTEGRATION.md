# تكامل بوابة الدفع URWAY مع مشروع لامار بارك

## نظرة عامة
تم تكامل بوابة الدفع URWAY مع مشروع لامار بارك لتوفير حل دفع آمن ومتعدد الطرق للعملاء.

## المميزات
- ✅ دعم البطاقات الائتمانية (فيزا، ماستركارد، مدى)
- ✅ دعم البطاقات البنكية
- ✅ دعم التحويلات البنكية
- ✅ دعم المحافظ الإلكترونية
- ✅ تشفير SHA256 للأمان
- ✅ التحقق من صحة المعاملات
- ✅ دعم بيئتي الاختبار والإنتاج

## المتطلبات

### 1. الحصول على حساب URWAY
- التسجيل في [URWAY](https://www.urway.sa)
- الحصول على بيانات الحساب:
  - Terminal ID
  - Password
  - Secret Key
  - API URLs

### 2. إعداد المتغيرات البيئية
أضف المتغيرات التالية إلى ملف `.env`:

```env
# Test Environment
URWAY_TERMINAL_ID_TEST=your_test_terminal_id
URWAY_PASSWORD_TEST=your_test_password
URWAY_SECRET_KEY_TEST=your_test_secret_key

# Production Environment
URWAY_TERMINAL_ID_PROD=your_production_terminal_id
URWAY_PASSWORD_PROD=your_production_password
URWAY_SECRET_KEY_PROD=your_production_secret_key
```

## كيفية الاستخدام

### 1. إنشاء عملية دفع
```javascript
// Frontend
const response = await fetch('/api/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 100.00,
    trackId: 'BOOKING_123456',
    customerEmail: 'customer@example.com',
    country: 'SA',
    currency: 'SAR'
  })
});

const data = await response.json();
if (data.success) {
  window.location.href = data.paymentUrl;
}
```

### 2. معالجة استجابة الدفع
```javascript
// Backend
app.get('/api/payments/response', (req, res) => {
  const { TranId, Result, ResponseCode, amount, responseHash } = req.query;
  
  // التحقق من صحة الـ hash
  const calculatedHash = generateResponseHash(TranId, secretKey, ResponseCode, amount);
  
  if (calculatedHash === responseHash && Result === 'Successful') {
    // تحديث حالة الحجز
    // إرسال تأكيد للعميل
  }
});
```

## API Endpoints

### POST /api/payments/create
إنشاء عملية دفع جديدة

**Request Body:**
```json
{
  "amount": 100.00,
  "trackId": "BOOKING_123456",
  "customerEmail": "customer@example.com",
  "country": "SA",
  "currency": "SAR"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://payments.urway-tech.com/URWAYPGService/direct.jsp?paymentid=123456",
  "payId": "123456",
  "message": "Payment initiated successfully"
}
```

### GET /api/payments/response
معالجة استجابة الدفع من URWAY

**Query Parameters:**
- PaymentId: معرف الدفع
- TranId: معرف المعاملة
- Result: نتيجة الدفع
- ResponseCode: رمز الاستجابة
- responseHash: hash التحقق

### POST /api/payments/inquiry
استعلام عن حالة معاملة

**Request Body:**
```json
{
  "transId": "123456",
  "trackId": "BOOKING_123456",
  "amount": 100.00,
  "currency": "SAR"
}
```

## رموز الاستجابة

| الرمز | الوصف |
|-------|-------|
| 000 | نجح الدفع |
| 001 | في انتظار التأكيد |
| 101 | حقل فارغ في الطلب |
| 201 | Terminal غير موجود |
| 202 | Merchant غير موجود |

## الأمان

### 1. تشفير Hash
يتم إنشاء hash باستخدام SHA256:
```
hashSequence = trackid|TerminalId|password|secret_key|amount|currency
```

### 2. التحقق من الاستجابة
يتم التحقق من صحة الاستجابة:
```
responseHash = TranId|secret_key|ResponseCode|amount
```

### 3. حماية البيانات
- لا يتم حفظ بيانات البطاقة
- جميع الاتصالات مشفرة
- التحقق من صحة كل معاملة

## الاختبار

### 1. بيئة الاختبار
- URL: `https://payments-dev.urway-tech.com/URWAYPGService`
- جميع المعاملات تجريبية
- لا يتم خصم مبالغ حقيقية

### 2. بيانات الاختبار
```
Terminal ID: [من URWAY]
Password: [من URWAY]
Secret Key: [من URWAY]
```

## الإنتاج

### 1. بيئة الإنتاج
- URL: `https://payments.urway-tech.com/URWAYPGService`
- معاملات حقيقية
- خصم مبالغ حقيقية

### 2. التحول للإنتاج
1. تغيير `NODE_ENV` إلى `production`
2. تحديث المتغيرات البيئية
3. اختبار شامل
4. مراقبة المعاملات

## استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في Hash**
   - تأكد من صحة Secret Key
   - تحقق من ترتيب المعاملات

2. **خطأ في Terminal ID**
   - تأكد من صحة Terminal ID
   - تحقق من حالة الحساب

3. **خطأ في الاتصال**
   - تحقق من صحة URL
   - تأكد من الاتصال بالإنترنت

### سجلات الأخطاء
```javascript
console.error('Payment error:', error);
// تحقق من سجلات الخادم
```

## الدعم

للحصول على الدعم:
- توثيق URWAY: [https://www.urway.sa](https://www.urway.sa)
- فريق الدعم التقني: [support@urway.sa](mailto:support@urway.sa)

## التحديثات

### v1.0.0
- التكامل الأساسي مع URWAY
- دعم البطاقات الائتمانية
- التحقق من صحة المعاملات
- واجهة مستخدم عربية 