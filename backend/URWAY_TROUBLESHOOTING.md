# 🔧 حل مشاكل URWAY - Lamar Park

## 🚨 المشكلة الحالية
خطأ URWAY: "System Error, Please contact System Admin" مع رمز الاستجابة "601"

## 🔍 تشخيص المشكلة

### 1. فحص إعدادات URWAY
اذهب إلى: `http://localhost:5000/test-urway-settings`

### 2. فحص ملف .env
تأكد من وجود البيانات التالية في ملف `.env`:

```env
# URWAY Production Environment
URWAY_TERMINAL_ID_PROD=your_production_terminal_id
URWAY_PASSWORD_PROD=your_production_password
URWAY_SECRET_KEY_PROD=your_production_secret_key

# Environment
NODE_ENV=production
```

### 3. فحص سجلات الخادم
```bash
# راقب سجلات الخادم
npm run dev

# ابحث عن:
# - URWAY Session Request
# - URWAY Request Data
# - URWAY Response
# - URWAY Error Response
```

## 🛠️ الحلول المحتملة

### الحل 1: فحص بيانات URWAY
```bash
# تأكد من صحة البيانات
1. اذهب إلى: http://localhost:5000/test-urway-settings
2. اضغط "فحص الإعدادات"
3. تحقق من وجود جميع البيانات المطلوبة
```

### الحل 2: تغيير البيئة للاختبار
```env
# في ملف .env
NODE_ENV=development

# إضافة بيانات الاختبار
URWAY_TERMINAL_ID_TEST=your_test_terminal_id
URWAY_PASSWORD_TEST=your_test_password
URWAY_SECRET_KEY_TEST=your_test_secret_key
```

### الحل 3: فحص تنسيق البيانات
```javascript
// البيانات المطلوبة
{
  "amount": 100,
  "customerEmail": "test@example.com",
  "customerName": "Test User",
  "customerMobile": "+966501234567",
  "trackId": "TEST_123",
  "currency": "SAR"
}
```

### الحل 4: فحص الـ Hash
```javascript
// تنسيق الـ Hash
const hashString = `${trackId}|${terminalId}|${password}|${secretKey}|${amount}|${currency}`;
const hash = crypto.createHash('sha256').update(hashString).digest('hex');
```

## 📊 رموز الأخطاء الشائعة

### رمز 601: System Error
- **السبب:** مشكلة في إعدادات URWAY
- **الحل:** تحقق من صحة البيانات في ملف .env

### رمز 602: Invalid Terminal ID
- **السبب:** Terminal ID غير صحيح
- **الحل:** تحقق من URWAY_TERMINAL_ID_PROD

### رمز 603: Invalid Password
- **السبب:** كلمة المرور غير صحيحة
- **الحل:** تحقق من URWAY_PASSWORD_PROD

### رمز 604: Invalid Hash
- **السبب:** الـ Hash غير صحيح
- **الحل:** تحقق من URWAY_SECRET_KEY_PROD

## 🧪 اختبار شامل

### الخطوة 1: اختبار الاتصال
```bash
# اذهب إلى
http://localhost:5000/test-urway-settings

# اضغط "اختبار الاتصال"
```

### الخطوة 2: اختبار الإعدادات
```bash
# اضغط "فحص الإعدادات"
# تحقق من النتيجة
```

### الخطوة 3: اختبار الجلسة
```bash
# املأ البيانات:
# - المبلغ: 100
# - البريد: test@example.com
# - الاسم: Test User
# - الهاتف: +966501234567
# - Track ID: TEST_123

# اضغط "إنشاء جلسة URWAY"
```

## 🔧 إصلاحات سريعة

### إصلاح 1: إعادة تشغيل الخادم
```bash
# إيقاف الخادم (Ctrl+C)
# إعادة التشغيل
npm run dev
```

### إصلاح 2: مسح Cache
```bash
# مسح node_modules
rm -rf node_modules
npm install

# إعادة تشغيل
npm run dev
```

### إصلاح 3: فحص المتغيرات البيئية
```bash
# في ملف .env
NODE_ENV=production
URWAY_TERMINAL_ID_PROD=your_real_terminal_id
URWAY_PASSWORD_PROD=your_real_password
URWAY_SECRET_KEY_PROD=your_real_secret_key
```

## 📞 الدعم

### في حالة استمرار المشكلة:
1. تحقق من سجلات الخادم
2. راجع بيانات URWAY مع المزود
3. اختبر في بيئة الاختبار أولاً
4. تأكد من تفعيل الحساب في URWAY

### روابط مفيدة:
- **صفحة اختبار الإعدادات:** `http://localhost:5000/test-urway-settings`
- **صفحة اختبار URWAY:** `http://localhost:5000/test-urway-config`
- **صفحة الدفع المباشر:** `http://localhost:5000/test-direct-payment`

---

**🔧 جرب الحلول بالترتيب واختبر بعد كل خطوة** 