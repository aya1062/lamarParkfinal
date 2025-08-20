# دليل إعداد نظام الحجز والدفع الإلكتروني - Lamar Park

## 🚀 نظرة عامة
هذا الدليل يوضح كيفية إعداد وتشغيل نظام الحجز والدفع الإلكتروني الجديد لمشروع Lamar Park.

## 📋 المتطلبات الأساسية

### البرامج المطلوبة:
- Node.js (v16 أو أحدث)
- npm أو yarn
- MongoDB
- Git

### الحسابات المطلوبة:
- حساب Stripe (للدفع الإلكتروني)
- حساب Railway (للنشر - اختياري)

## 🔧 خطوات الإعداد

### 1. إعداد Stripe

#### أ. إنشاء حساب Stripe:
1. اذهب إلى [stripe.com](https://stripe.com)
2. أنشئ حساب جديد
3. أكمل عملية التحقق من الهوية

#### ب. الحصول على مفاتيح API:
1. اذهب إلى Stripe Dashboard
2. انتقل إلى Developers → API keys
3. انسخ المفاتيح التالية:
   - **Publishable key** (يبدأ بـ `pk_test_` أو `pk_live_`)
   - **Secret key** (يبدأ بـ `sk_test_` أو `sk_live_`)

#### ج. إعداد Webhook:
1. اذهب إلى Developers → Webhooks
2. اضغط على "Add endpoint"
3. أدخل URL: `https://your-domain.com/api/checkout/webhook`
4. اختر الأحداث التالية:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. انسخ Webhook secret

### 2. إعداد قاعدة البيانات

#### أ. MongoDB:
1. أنشئ قاعدة بيانات MongoDB
2. احصل على connection string
3. تأكد من أن قاعدة البيانات تدعم SSL

### 3. إعداد المتغيرات البيئية

#### أ. Backend (.env):
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/lamar
# أو
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lamar

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Client URL (for Stripe redirects)
CLIENT_URL=http://localhost:3000
```

#### ب. Frontend (.env):
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# App Configuration
VITE_APP_NAME=Lamar Park
VITE_APP_VERSION=1.0.0
```

### 4. تثبيت التبعيات

#### أ. Backend:
```bash
cd lamarPark
npm install
```

#### ب. Frontend:
```bash
cd client
npm install
```

### 5. تشغيل النظام

#### أ. تشغيل Backend:
```bash
# في مجلد المشروع الرئيسي
npm run dev
```

#### ب. تشغيل Frontend:
```bash
# في مجلد client
npm run dev
```

## 🧪 اختبار النظام

### 1. اختبار API:
استخدم Postman أو أي أداة مشابهة لاختبار النقاط التالية:

#### أ. تسجيل مستخدم جديد:
```
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "123456",
  "phone": "+966 50 123 4567"
}
```

#### ب. حساب السعر:
```
POST http://localhost:5000/api/pricing/calculate
Content-Type: application/json

{
  "propertyId": "PROPERTY_ID",
  "checkIn": "2024-02-15",
  "checkOut": "2024-02-17"
}
```

#### ج. إنشاء جلسة دفع:
```
POST http://localhost:5000/api/checkout/create-session
Content-Type: application/json

{
  "propertyId": "PROPERTY_ID",
  "checkIn": "2024-02-15",
  "checkOut": "2024-02-17",
  "guests": 2,
  "guestInfo": {
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "+966 50 123 4567"
  },
  "totalPrice": 2400,
  "nights": 2
}
```

### 2. اختبار الدفع:
استخدم بطاقات الاختبار التالية:

#### بطاقات نجاح الدفع:
- `4242 4242 4242 4242` - Visa
- `5555 5555 5555 4444` - Mastercard
- `3782 822463 10005` - American Express

#### بطاقات فشل الدفع:
- `4000 0000 0000 0002` - رفض عام
- `4000 0000 0000 9995` - رفض بسبب رصيد غير كافي
- `4000 0000 0000 9987` - رفض بسبب بطاقة منتهية الصلاحية

### 3. اختبار Webhook:
1. استخدم Stripe CLI لاختبار Webhook محلياً:
```bash
stripe listen --forward-to localhost:5000/api/checkout/webhook
```

2. أو استخدم ngrok لإنشاء نفق:
```bash
ngrok http 5000
```

## 🚀 النشر على Railway

### 1. إعداد Railway:
```bash
# تثبيت Railway CLI
npm install -g @railway/cli

# تسجيل الدخول
railway login

# تهيئة المشروع
railway init
```

### 2. إعداد المتغيرات البيئية:
1. اذهب إلى Railway Dashboard
2. اختر مشروعك
3. اذهب إلى Variables
4. أضف جميع المتغيرات المطلوبة

### 3. النشر:
```bash
railway up
```

## 🔍 استكشاف الأخطاء

### مشاكل شائعة:

#### 1. خطأ في الاتصال بقاعدة البيانات:
- تأكد من صحة connection string
- تأكد من أن MongoDB يعمل
- تحقق من إعدادات الشبكة

#### 2. خطأ في Stripe:
- تأكد من صحة مفاتيح API
- تأكد من أن الحساب مفعل
- تحقق من إعدادات Webhook

#### 3. خطأ في CORS:
- تأكد من إعدادات CORS في Backend
- تحقق من URLs المسموح بها

#### 4. خطأ في Webhook:
- تأكد من صحة Webhook secret
- تحقق من أن URL صحيح
- تأكد من أن الخادم يستقبل POST requests

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع ملفات السجلات (logs)
2. تحقق من إعدادات البيئة
3. تأكد من أن جميع الخدمات تعمل
4. راجع توثيق Stripe

## 🔄 التحديثات

للتحديث إلى أحدث إصدار:
```bash
git pull origin main
npm install
cd client && npm install
```

## 📝 ملاحظات مهمة

1. **أمان**: لا تشارك مفاتيح Stripe مع أي شخص
2. **البيئة**: تأكد من استخدام مفاتيح الاختبار في البيئة التطويرية
3. **النسخ الاحتياطي**: احتفظ بنسخة احتياطية من قاعدة البيانات
4. **المراقبة**: راقب سجلات Stripe للتأكد من عدم وجود مشاكل

---

**تم إنشاء هذا الدليل بواسطة فريق تطوير Lamar Park** 