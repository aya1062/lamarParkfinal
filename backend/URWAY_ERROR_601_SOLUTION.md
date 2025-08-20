# حل مشكلة الخطأ 601 في URWAY

## المشكلة
```
{
    "message": "URWAY error",
    "urwayData": {
        "result": "UnSuccessful",
        "reason": "System Error, Please contact System Admin",
        "responseCode": "601"
    }
}
```

## أسباب الخطأ 601

### 1. بيانات URWAY غير صحيحة
- Terminal ID غير صحيح
- Password غير صحيح
- Secret Key غير صحيح

### 2. الحساب غير مفعل
- الحساب في حالة انتظار
- الحساب معلق
- الحساب غير مفعل من URWAY

### 3. مشكلة في إعدادات الحساب
- Terminal غير مفعل
- Merchant غير مفعل
- Institution غير مفعل

## الحلول

### الخطوة 1: التحقق من البيانات
افتح صفحة فحص الإعدادات:
```
http://localhost:5000/test-urway-config-check
```

تحقق من:
- ✅ `URWAY_TERMINAL_ID_PROD: SET`
- ✅ `URWAY_PASSWORD_PROD: SET`
- ✅ `URWAY_SECRET_KEY_PROD: SET`

### الخطوة 2: التحقق من قيم البيانات
في صفحة فحص الإعدادات، تحقق من:
- `terminalIdValue`: يجب أن يكون Terminal ID صحيح
- `passwordLength`: يجب أن يكون أكبر من 0
- `secretKeyLength`: يجب أن يكون أكبر من 0

### الخطوة 3: إعادة التحقق من URWAY
1. اذهب إلى [https://www.urway.sa](https://www.urway.sa)
2. سجل دخول إلى لوحة التحكم
3. تحقق من:
   - حالة الحساب (مفعل/غير مفعل)
   - Terminal ID صحيح
   - Password صحيح
   - Secret Key صحيح

### الخطوة 4: اختبار البيانات
```bash
# اختبار بسيط
curl -X GET http://localhost:5000/api/urway/check-config
```

### الخطوة 5: إذا كانت البيانات صحيحة
تواصل مع دعم URWAY:
- البريد الإلكتروني: [support@urway.sa](mailto:support@urway.sa)
- الهاتف: [رقم الدعم من موقع URWAY]
- اذكر لهم:
  - Terminal ID
  - نوع الخطأ (601)
  - أن الحساب مفعل

## تشخيص إضافي

### تحقق من سجلات الخادم
ابحث عن هذه الرسائل في terminal الخادم:
```
=== URWAY CONFIGURATION DEBUG ===
URWAY_TERMINAL_ID_PROD: SET
URWAY_PASSWORD_PROD: SET
URWAY_SECRET_KEY_PROD: SET
```

### تحقق من البيانات المرسلة
ابحث عن:
```
URWAY Configuration Debug:
terminalId: [قيمة Terminal ID]
password: SET
secretKey: SET
```

## حلول سريعة

### 1. إذا كانت البيانات غير صحيحة
```env
# في ملف .env
URWAY_TERMINAL_ID_PROD=your_correct_terminal_id
URWAY_PASSWORD_PROD=your_correct_password
URWAY_SECRET_KEY_PROD=your_correct_secret_key
```

### 2. إذا كان الحساب غير مفعل
- تواصل مع URWAY لتفعيل الحساب
- انتظر تأكيد التفعيل

### 3. إذا كانت المشكلة في الإعدادات
- تحقق من إعدادات Terminal في لوحة تحكم URWAY
- تأكد من أن Terminal مفعل
- تأكد من أن Merchant مفعل

## اختبار بعد الإصلاح

### 1. إعادة تشغيل الخادم
```bash
npm run dev
```

### 2. اختبار الإعدادات
```
http://localhost:5000/test-urway-config-check
```

### 3. اختبار إنشاء جلسة
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

## رموز الأخطاء المرتبطة

| الرمز | الوصف | الحل |
|-------|-------|-------|
| 601 | System Error, Please contact System Admin | تحقق من البيانات أو تواصل مع URWAY |
| 607 | Invalid Terminal Id | تحقق من Terminal ID |
| 610 | Invalid Terminal Password | تحقق من Password |
| 201 | Terminal does not exists | تحقق من وجود Terminal |
| 202 | Merchant does not exists | تحقق من وجود Merchant |

## ملاحظات مهمة

1. **لا تشارك Secret Key مع أي شخص**
2. **تأكد من صحة البيانات قبل الاستخدام**
3. **اختبر في بيئة التطوير أولاً**
4. **احتفظ بنسخة احتياطية من البيانات**

## الدعم

إذا لم تحل المشكلة:
- توثيق URWAY: [https://www.urway.sa](https://www.urway.sa)
- فريق الدعم التقني: [support@urway.sa](mailto:support@urway.sa)
- اذكر لهم Terminal ID والخطأ 601 