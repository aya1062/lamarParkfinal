# تعليمات سريعة لحل مشكلة URWAY

## المشكلة الحالية
```
URWAY configuration error - missing credentials
```

## الحل السريع

### الخطوة 1: إنشاء ملف .env
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

### الخطوة 2: الحصول على بيانات URWAY
1. اذهب إلى [https://www.urway.sa](https://www.urway.sa)
2. سجل حساب جديد
3. احصل على البيانات التالية من لوحة التحكم:
   - Terminal ID
   - Password
   - Secret Key

### الخطوة 3: تحديث ملف .env
استبدل القيم في ملف `.env` بالبيانات الحقيقية من URWAY:

```env
URWAY_TERMINAL_ID_TEST=123456789
URWAY_PASSWORD_TEST=your_actual_password
URWAY_SECRET_KEY_TEST=your_actual_secret_key
```

### الخطوة 4: إعادة تشغيل الخادم
```bash
# إيقاف الخادم (Ctrl+C)
# ثم إعادة التشغيل
npm run dev
```

### الخطوة 5: اختبار الإعدادات
افتح المتصفح واذهب إلى:
```
http://localhost:5000/test-urway-config-check
```

تأكد من أن جميع الحقول تظهر "SET" وليس "NOT SET".

## إذا استمرت المشكلة

### 1. تحقق من وجود الملف
```bash
# في المجلد الرئيسي للمشروع
ls -la .env
```

### 2. تحقق من محتوى الملف
```bash
cat .env
```

### 3. تحقق من سجلات الخادم
```bash
# في terminal الخادم
# ابحث عن رسائل "URWAY CONFIGURATION DEBUG"
```

### 4. اختبار الاتصال
```bash
curl -X GET http://localhost:5000/api/urway/check-config
```

## رموز الأخطاء الشائعة

| الرمز | المعنى | الحل |
|-------|--------|------|
| 601 | System Error | تحقق من بيانات URWAY |
| 607 | Invalid Terminal Id | تحقق من Terminal ID |
| 610 | Invalid Password | تحقق من Password |

## الدعم
إذا لم تحل المشكلة، راجع:
- `URWAY_SOLUTION_GUIDE.md` للدليل التفصيلي
- `URWAY_TROUBLESHOOTING.md` لاستكشاف الأخطاء 