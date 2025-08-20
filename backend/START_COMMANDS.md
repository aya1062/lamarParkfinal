# 🚀 أوامر تشغيل النظام - Lamar Park

## ⚡ الأوامر السريعة

### 1. تشغيل النظام كاملاً
```bash
# Terminal 1 - Backend
cd lamarPark
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 2. تثبيت التبعيات
```bash
# Backend
npm install

# Frontend
cd client
npm install
```

### 3. بناء Frontend للإنتاج
```bash
cd client
npm run build
```

## 🔧 أوامر إضافية

### تشغيل MongoDB
```bash
mongod
```

### فحص حالة الخدمات
```bash
# فحص Backend
curl http://localhost:5000

# فحص Frontend
curl http://localhost:3000
```

### فحص قاعدة البيانات
```bash
# الدخول لـ MongoDB
mongosh

# عرض قواعد البيانات
show dbs

# استخدام قاعدة البيانات
use lamarPark

# عرض المجموعات
show collections
```

## 🧪 أوامر الاختبار

### اختبار API
```bash
# اختبار الخادم
curl http://localhost:5000

# اختبار العقارات
curl http://localhost:5000/api/properties

# اختبار الحجوزات
curl http://localhost:5000/api/bookings
```

### اختبار الدفع
```bash
# اختبار URWAY
curl -X POST http://localhost:5000/api/urway/create-urway-session \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "customerEmail": "test@example.com",
    "customerName": "Test User",
    "customerMobile": "+966501234567",
    "trackId": "TEST_123"
  }'
```

## 📱 روابط الوصول

### Frontend (React):
- **الصفحة الرئيسية:** http://localhost:3000
- **صفحة الحجز:** http://localhost:3000/booking/1
- **صفحة نجاح الحجز:** http://localhost:3000/booking/success
- **صفحة استجابة الدفع:** http://localhost:3000/payment/response

### Backend (Express):
- **API الرئيسي:** http://localhost:5000
- **صفحة اختبار الدفع:** http://localhost:5000/test-direct-payment
- **صفحة URWAY المباشر:** http://localhost:5000/test-urway-direct
- **صفحة اختبار URWAY:** http://localhost:5000/test-urway-config

## 🔍 أوامر التشخيص

### فحص الأخطاء
```bash
# فحص سجلات Backend
npm run dev

# فحص سجلات Frontend
cd client
npm run dev

# فحص قاعدة البيانات
mongosh lamarPark
```

### فحص الشبكة
```bash
# فحص المنافذ
netstat -an | grep :5000
netstat -an | grep :3000

# فحص الاتصال
ping localhost
```

## 🛠️ أوامر الإصلاح

### إعادة تشغيل النظام
```bash
# إيقاف الخدمات (Ctrl+C)
# ثم إعادة التشغيل

# Backend
npm run dev

# Frontend
cd client
npm run dev
```

### مسح Cache
```bash
# مسح node_modules وإعادة التثبيت
rm -rf node_modules
npm install

# مسح cache المتصفح
# Ctrl+Shift+R في المتصفح
```

### إعادة تعيين قاعدة البيانات
```bash
# حذف قاعدة البيانات
mongosh
use lamarPark
db.dropDatabase()

# إعادة إنشاء البيانات
npm run setup
```

## 📊 أوامر المراقبة

### مراقبة الموارد
```bash
# مراقبة CPU و Memory
top

# مراقبة Disk Usage
df -h

# مراقبة Network
netstat -i
```

### مراقبة السجلات
```bash
# مراقبة سجلات Backend
tail -f logs/app.log

# مراقبة سجلات MongoDB
tail -f /var/log/mongodb/mongod.log
```

## 🚀 أوامر النشر

### بناء للإنتاج
```bash
# بناء Frontend
cd client
npm run build

# تشغيل Backend للإنتاج
cd ..
NODE_ENV=production npm start
```

### تشغيل كـ Service
```bash
# استخدام PM2
npm install -g pm2
pm2 start server.js --name "lamar-park"

# مراقبة الخدمات
pm2 status
pm2 logs
```

---

**⚡ استخدم هذه الأوامر لتشغيل النظام بسرعة وفعالية** 