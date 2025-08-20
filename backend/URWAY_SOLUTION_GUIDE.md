# دليل حل مشكلة URWAY Configuration Error

## المشكلة
```
URWAY configuration error - missing credentials
```

## السبب الجذري
المشكلة الأساسية هي أن ملف `.env` غير موجود أو لا يحتوي على بيانات URWAY الصحيحة.

## الحلول

### 1. إنشاء ملف .env
قم بإنشاء ملف `.env` في المجلد الرئيسي للمشروع (نفس مستوى `package.json`):

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lamarPark

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development

# URWAY Payment Gateway Configuration
# Test Environment
URWAY_TERMINAL_ID_TEST=your_test_terminal_id
URWAY_PASSWORD_TEST=your_test_password
URWAY_SECRET_KEY_TEST=your_test_secret_key

# Production Environment
URWAY_TERMINAL_ID_PROD=your_production_terminal_id
URWAY_PASSWORD_PROD=your_production_password
URWAY_SECRET_KEY_PROD=your_production_secret_key
```

### 2. الحصول على بيانات URWAY
للحصول على بيانات URWAY:

1. **التسجيل في URWAY**: [https://www.urway.sa](https://www.urway.sa)
2. **الدخول إلى لوحة التحكم**
3. **الحصول على البيانات التالية**:
   - Terminal ID
   - Password
   - Secret Key
   - API URLs

### 3. اختبار الإعدادات
بعد إنشاء ملف `.env`، قم باختبار الإعدادات:

```bash
# إعادة تشغيل الخادم
npm run dev

# فتح صفحة فحص الإعدادات
http://localhost:5000/test-urway-config-check
```

### 4. التحقق من البيانات
في صفحة فحص الإعدادات، تأكد من أن جميع الحقول تظهر "SET" وليس "NOT SET".

## التحديثات المطبقة

### 1. تحسين كود URWAY Controller
- ✅ تصحيح تنفيذ API حسب التوثيق الرسمي
- ✅ تحسين توليد Hash
- ✅ إضافة التحقق من صحة الاستجابة
- ✅ إضافة دالة استعلام المعاملات

### 2. تحسين معالجة الاستجابة
- ✅ تصحيح أسماء الحقول (TrackId بدلاً من trackid)
- ✅ إضافة التحقق من Hash
- ✅ تحسين تحديث بيانات الحجز

### 3. إضافة دالة الاستعلام
- ✅ دالة `inquiryTransaction` للاستعلام عن حالة المعاملات
- ✅ مسار `/api/urway/inquiry`

## اختبار التكامل

### 1. اختبار إنشاء الجلسة
```bash
curl -X POST http://localhost:5000/api/urway/create-urway-session \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "customerEmail": "test@example.com",
    "customerName": "Test User",
    "customerMobile": "0500000000",
    "trackId": "TEST_123",
    "currency": "SAR"
  }'
```

### 2. اختبار الاستعلام
```bash
curl -X POST http://localhost:5000/api/urway/inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "transId": "transaction_id",
    "trackId": "TEST_123",
    "amount": 100,
    "currency": "SAR"
  }'
```

## رموز الاستجابة المهمة

| الرمز | الوصف | الحل |
|-------|-------|-------|
| 601 | System Error, Please contact System Admin | تحقق من إعدادات URWAY |
| 602 | System Error,Please try again | إعادة المحاولة |
| 607 | Invalid Terminal Id | تحقق من Terminal ID |
| 610 | Invalid Terminal Password | تحقق من Password |
| 000 | Transaction Successful | نجح الدفع |

## استكشاف الأخطاء

### 1. إذا ظهر "NOT SET" لجميع الحقول:
- تأكد من وجود ملف `.env`
- تأكد من صحة أسماء المتغيرات
- أعد تشغيل الخادم

### 2. إذا ظهر خطأ 601:
- تحقق من صحة بيانات URWAY
- تأكد من أن الحساب مفعل
- تواصل مع دعم URWAY

### 3. إذا فشل إنشاء الجلسة:
- تحقق من صحة Hash
- تأكد من صحة البيانات المطلوبة
- راجع سجلات الخادم

## الدعم

للحصول على الدعم:
- توثيق URWAY: [https://www.urway.sa](https://www.urway.sa)
- فريق الدعم التقني: [support@urway.sa](mailto:support@urway.sa)

## ملاحظات مهمة

1. **لا تشارك Secret Key مع أي شخص**
2. **استخدم بيانات الاختبار أولاً**
3. **اختبر في بيئة التطوير قبل الإنتاج**
4. **احتفظ بنسخة احتياطية من ملف .env** 