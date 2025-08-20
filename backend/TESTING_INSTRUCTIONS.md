# 🚀 تعليمات تجربة تكامل URWAY

## الخطوات السريعة للتجربة:

### 1. تشغيل الخادم
```bash
npm start
```

### 2. الوصول لصفحة الاختبار
افتح المتصفح واذهب إلى:
- **صفحة HTML البسيطة**: `http://localhost:5000/test-payment.html`
- **صفحة React**: `http://localhost:3000/payment/test`

### 3. اختبار التكامل

#### أ) اختبار إنشاء الدفع:
1. املأ البيانات في النموذج
2. اضغط "إنشاء دفع تجريبي"
3. ستظهر بيانات الدفع في النافذة

#### ب) اختبار Hash:
1. اضغط "اختبار Hash"
2. ستظهر sequence الـ hash

### 4. مراقبة السجلات
راقب terminal الخادم لرؤية:
- طلبات الدفع
- استجابات URWAY
- أي أخطاء

## البيانات التجريبية المستخدمة:

```javascript
// Test Configuration
{
  terminalId: 'test_terminal_123',
  password: 'test_password_123', 
  secretKey: 'test_secret_key_123',
  baseUrl: 'https://payments-dev.urway-tech.com/URWAYPGService'
}
```

## API Endpoints المتاحة:

- `POST /api/payments/create` - إنشاء دفع
- `GET /api/payments/response` - استقبال رد URWAY
- `POST /api/payments/inquiry` - استعلام عن معاملة

## استكشاف الأخطاء:

### إذا ظهر خطأ "Route.post() requires a callback function":
- تأكد من تشغيل الخادم بشكل صحيح
- تحقق من ملف `paymentRoutes.js`

### إذا ظهر خطأ "Cannot find module":
- شغل `npm install` لتثبيت التبعيات

### إذا لم تستجب API:
- تأكد من تشغيل الخادم على المنفذ 5000
- تحقق من سجلات الخادم

## الخطوات التالية:

1. **الحصول على بيانات URWAY الحقيقية**
2. **تحديث المتغيرات البيئية**
3. **اختبار مع البيانات الحقيقية**
4. **الانتقال للإنتاج**

## روابط مفيدة:

- **صفحة الاختبار**: `http://localhost:5000/test-payment.html`
- **React App**: `http://localhost:3000`
- **API Base**: `http://localhost:5000/api`

## ملاحظات مهمة:

✅ **البيانات تجريبية** - لا يتم خصم مبالغ حقيقية  
✅ **Hash مشفر** - SHA256 للأمان  
✅ **واجهة عربية** - دعم كامل للعربية  
✅ **اختبار شامل** - جميع السيناريوهات  

---

**🎯 جاهز للتجربة! ابدأ بالخطوة الأولى واختبر التكامل** 