# إعداد URWAY المبسط

## التحديث الجديد
تم إزالة الاعتماد على `NODE_ENV` - الكود الآن يستخدم بيانات Production مباشرة.

## ملف .env المطلوب

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lamarPark

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000

# URWAY Payment Gateway Configuration - Production Only
URWAY_TERMINAL_ID_PROD=your_production_terminal_id
URWAY_PASSWORD_PROD=your_production_password
URWAY_SECRET_KEY_PROD=your_production_secret_key
```

## كيف يعمل الكود الآن

```javascript
// إعداد متغيرات URWAY من env - استخدام Production مباشرة
const {
  URWAY_TERMINAL_ID_PROD,
  URWAY_PASSWORD_PROD,
  URWAY_SECRET_KEY_PROD
} = process.env;

const URWAY_CONFIG = {
  terminalId: URWAY_TERMINAL_ID_PROD,
  password: URWAY_PASSWORD_PROD,
  secretKey: URWAY_SECRET_KEY_PROD,
  baseUrl: 'https://payments.urway-tech.com/URWAYPGService'  // Production URL
};
```

## الخطوات

### 1. إنشاء ملف .env
قم بإنشاء ملف `.env` في المجلد الرئيسي للمشروع:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lamarPark

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000

# URWAY Payment Gateway Configuration
URWAY_TERMINAL_ID_PROD=your_production_terminal_id
URWAY_PASSWORD_PROD=your_production_password
URWAY_SECRET_KEY_PROD=your_production_secret_key
```

### 2. الحصول على بيانات URWAY
1. اذهب إلى [https://www.urway.sa](https://www.urway.sa)
2. سجل حساب جديد
3. احصل على البيانات التالية من لوحة التحكم:
   - Terminal ID
   - Password
   - Secret Key

### 3. تحديث ملف .env
استبدل القيم في ملف `.env` بالبيانات الحقيقية:

```env
URWAY_TERMINAL_ID_PROD=123456789
URWAY_PASSWORD_PROD=your_actual_password
URWAY_SECRET_KEY_PROD=your_actual_secret_key
```

### 4. إعادة تشغيل الخادم
```bash
npm run dev
```

### 5. اختبار الإعدادات
افتح المتصفح واذهب إلى:
```
http://localhost:5000/test-urway-config-check
```

تأكد من أن جميع الحقول تظهر "SET".

## اختبار التكامل

### اختبار إنشاء الجلسة
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

## رموز الاستجابة المهمة

| الرمز | الوصف | الحل |
|-------|-------|-------|
| 601 | System Error, Please contact System Admin | تحقق من إعدادات URWAY |
| 607 | Invalid Terminal Id | تحقق من Terminal ID |
| 610 | Invalid Terminal Password | تحقق من Password |
| 000 | Transaction Successful | نجح الدفع |

## استكشاف الأخطاء

### إذا ظهر "NOT SET":
1. تأكد من وجود ملف `.env`
2. تأكد من صحة أسماء المتغيرات:
   - `URWAY_TERMINAL_ID_PROD`
   - `URWAY_PASSWORD_PROD`
   - `URWAY_SECRET_KEY_PROD`
3. أعد تشغيل الخادم

### إذا ظهر خطأ 601:
1. تحقق من صحة بيانات URWAY
2. تأكد من أن الحساب مفعل
3. تواصل مع دعم URWAY

## ملاحظات مهمة

⚠️ **تحذير**: هذا الإعداد يستخدم بيئة Production مباشرة:
- ستستخدم **معاملات حقيقية**
- ستخصم **مبالغ حقيقية**
- تأكد من صحة البيانات قبل الاستخدام

## الدعم

للحصول على الدعم:
- توثيق URWAY: [https://www.urway.sa](https://www.urway.sa)
- فريق الدعم التقني: [support@urway.sa](mailto:support@urway.sa) 