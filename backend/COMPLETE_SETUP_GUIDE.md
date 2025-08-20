# 🚀 دليل تشغيل الموقع الكامل - Lamar Park

## 📋 نظرة عامة
هذا الدليل يوضح كيفية تشغيل الموقع كاملاً مع ربط نظام الحجز والدفع عبر URWAY.

## 🔧 المتطلبات الأساسية

### البرامج المطلوبة:
- Node.js (v16 أو أحدث)
- npm أو yarn
- MongoDB
- Git

### الحسابات المطلوبة:
- حساب URWAY (للدفع الإلكتروني)

## 🛠️ خطوات الإعداد

### 1. إعداد قاعدة البيانات
```bash
# تأكد من تشغيل MongoDB
mongod
```

### 2. إعداد المتغيرات البيئية
أنشئ ملف `.env` في جذر المشروع:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lamarPark

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
NODE_ENV=production

# URWAY Payment Gateway Configuration
URWAY_TERMINAL_ID_PROD=your_production_terminal_id
URWAY_PASSWORD_PROD=your_production_password
URWAY_SECRET_KEY_PROD=your_production_secret_key

# Test Environment (اختياري)
URWAY_TERMINAL_ID_TEST=your_test_terminal_id
URWAY_PASSWORD_TEST=your_test_password
URWAY_SECRET_KEY_TEST=your_test_secret_key
```

### 3. تثبيت التبعيات

#### Backend:
```bash
cd lamarPark
npm install
```

#### Frontend:
```bash
cd client
npm install
```

### 4. تشغيل النظام

#### تشغيل Backend:
```bash
# في مجلد المشروع الرئيسي
npm run dev
```

#### تشغيل Frontend:
```bash
# في مجلد client
npm run dev
```

## 🔄 فلو الحجز والدفع

### 1. فلو الحجز العادي (الدفع عند الوصول)
```
1. المستخدم يختار عقار
2. يحدد التواريخ وعدد الأشخاص
3. يملأ بيانات الحجز
4. يختار "الدفع عند الوصول"
5. يتم إنشاء الحجز مباشرة
6. ينتقل لصفحة نجاح الحجز
```

### 2. فلو الحجز مع الدفع عبر URWAY
```
1. المستخدم يختار عقار
2. يحدد التواريخ وعدد الأشخاص
3. يملأ بيانات الحجز
4. يختار "الدفع عبر URWAY"
5. يتم إنشاء جلسة دفع في URWAY
6. ينتقل لصفحة الدفع في URWAY
7. بعد الدفع، يعود لصفحة نجاح الحجز
8. يتم إنشاء الحجز تلقائياً
```

## 🧪 اختبار النظام

### 1. اختبار الحجز العادي
1. اذهب إلى: `http://localhost:3000`
2. اختر عقار
3. حدد التواريخ
4. املأ البيانات
5. اختر "الدفع عند الوصول"
6. تأكد من إنشاء الحجز

### 2. اختبار الحجز مع URWAY
1. اذهب إلى: `http://localhost:3000`
2. اختر عقار
3. حدد التواريخ
4. املأ البيانات
5. اختر "الدفع عبر URWAY"
6. تأكد من الانتقال لصفحة الدفع
7. اختبر الدفع (بيانات تجريبية)
8. تأكد من العودة لصفحة النجاح

### 3. اختبار الدفع المباشر
1. اذهب إلى: `http://localhost:5000/test-direct-payment`
2. املأ البيانات
3. اختبر إنشاء الدفع
4. تأكد من الانتقال لصفحة URWAY

## 📱 الصفحات المتاحة

### صفحات الحجز:
- **الصفحة الرئيسية:** `http://localhost:3000`
- **صفحة العقار:** `http://localhost:3000/property/:id`
- **صفحة الحجز:** `http://localhost:3000/booking/:id`
- **صفحة نجاح الحجز:** `http://localhost:3000/booking/success`

### صفحات الدفع:
- **صفحة الدفع المباشر:** `http://localhost:5000/test-direct-payment`
- **صفحة URWAY المباشر:** `http://localhost:5000/test-urway-direct`
- **صفحة اختبار URWAY:** `http://localhost:5000/test-urway-config`
- **صفحة استجابة الدفع:** `http://localhost:3000/payment/response`

### صفحات الإدارة:
- **لوحة التحكم:** `http://localhost:3000/admin`
- **إدارة الحجوزات:** `http://localhost:3000/admin/bookings`
- **إدارة المستخدمين:** `http://localhost:3000/admin/users`

## 🔗 API Endpoints

### الحجوزات:
- `POST /api/bookings` - إنشاء حجز
- `GET /api/bookings` - جلب جميع الحجوزات
- `GET /api/bookings/:id` - جلب حجز محدد
- `PUT /api/bookings/:id` - تحديث حجز
- `DELETE /api/bookings/:id` - حذف حجز

### الدفع:
- `POST /api/payments/create` - إنشاء دفع مباشر
- `POST /api/urway/create-urway-session` - إنشاء جلسة URWAY
- `GET /api/urway/callback` - معالجة استجابة URWAY

### العقارات:
- `GET /api/properties` - جلب جميع العقارات
- `GET /api/properties/:id` - جلب عقار محدد
- `POST /api/properties/check-availability` - التحقق من التوفر

## 🛡️ الأمان

### التحقق من صحة البيانات:
- ✅ التحقق من التواريخ
- ✅ التحقق من توفر العقار
- ✅ التحقق من صحة بيانات العميل
- ✅ التحقق من صحة بيانات الدفع

### تشفير البيانات:
- ✅ تشفير كلمات المرور
- ✅ تشفير JWT tokens
- ✅ تشفير بيانات الدفع
- ✅ تشفير Hash URWAY

## 🔍 استكشاف الأخطاء

### مشاكل شائعة:

#### 1. خطأ في الاتصال بقاعدة البيانات:
```bash
# تأكد من تشغيل MongoDB
mongod

# تأكد من صحة connection string
MONGODB_URI=mongodb://localhost:27017/lamarPark
```

#### 2. خطأ في URWAY:
```bash
# تأكد من صحة بيانات URWAY
URWAY_TERMINAL_ID_PROD=your_terminal_id
URWAY_PASSWORD_PROD=your_password
URWAY_SECRET_KEY_PROD=your_secret_key

# تأكد من البيئة
NODE_ENV=production
```

#### 3. خطأ في Frontend:
```bash
# تأكد من تشغيل الخادم
npm run dev

# تأكد من صحة API URL
API_URL=http://localhost:5000/api
```

#### 4. خطأ في CORS:
```bash
# تأكد من إعدادات CORS في app.js
app.use(cors());
```

## 📊 مراقبة النظام

### سجلات الخادم:
```bash
# راقب سجلات الخادم
npm run dev

# ابحث عن:
# - طلبات الحجز
# - طلبات الدفع
# - أخطاء URWAY
# - أخطاء قاعدة البيانات
```

### سجلات المتصفح:
```bash
# افتح Developer Tools
# راقب Network tab
# ابحث عن:
# - طلبات API
# - أخطاء JavaScript
# - أخطاء CORS
```

## 🚀 النشر

### 1. إعداد الإنتاج:
```bash
# بناء Frontend
cd client
npm run build

# تشغيل Backend
cd ..
npm start
```

### 2. متغيرات الإنتاج:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
URWAY_TERMINAL_ID_PROD=your_production_terminal_id
URWAY_PASSWORD_PROD=your_production_password
URWAY_SECRET_KEY_PROD=your_production_secret_key
```

## 📞 الدعم

### في حالة وجود مشاكل:
1. راجع سجلات الخادم
2. تحقق من إعدادات البيئة
3. تأكد من تشغيل جميع الخدمات
4. راجع توثيق URWAY

### روابط مفيدة:
- **توثيق URWAY:** [https://www.urway.sa](https://www.urway.sa)
- **توثيق MongoDB:** [https://docs.mongodb.com](https://docs.mongodb.com)
- **توثيق Express:** [https://expressjs.com](https://expressjs.com)

---

**🎯 الموقع جاهز للاستخدام! ابدأ بالخطوة الأولى واختبر جميع الوظائف** 