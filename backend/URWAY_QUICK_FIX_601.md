# حل سريع لمشكلة الخطأ 601 في URWAY

## المشكلة الحالية
```
"terminalId": "lamar"  // هذا خطأ - يجب أن يكون رقم Terminal ID الحقيقي
"responseCode": "601"   // System Error
```

## الحل السريع

### 1. تحقق من ملف .env
افتح ملف `.env` في المجلد الرئيسي وتأكد من:

```env
# يجب أن تكون هذه البيانات صحيحة
URWAY_TERMINAL_ID_PROD=123456789  # رقم Terminal ID الحقيقي
URWAY_PASSWORD_PROD=your_password  # كلمة المرور الحقيقية
URWAY_SECRET_KEY_PROD=your_secret  # المفتاح السري الحقيقي
```

### 2. تحقق من البيانات
افتح: `http://localhost:5000/test-urway-debug`

اضغط على "فحص متغيرات البيئة" وتحقق من:
- `terminalIdValue`: يجب أن يكون رقم وليس "lamar"
- `passwordLength`: يجب أن يكون أكبر من 0
- `secretKeyLength`: يجب أن يكون أكبر من 0

### 3. إذا كانت البيانات غير صحيحة

#### أ. تحقق من أسماء المتغيرات
تأكد من أن أسماء المتغيرات في ملف `.env` هي:
- `URWAY_TERMINAL_ID_PROD` (وليس `URWAY_TERMINAL_ID`)
- `URWAY_PASSWORD_PROD` (وليس `URWAY_PASSWORD`)
- `URWAY_SECRET_KEY_PROD` (وليس `URWAY_SECRET_KEY`)

#### ب. تحقق من عدم وجود مسافات
```env
# صحيح
URWAY_TERMINAL_ID_PROD=123456789

# خطأ
URWAY_TERMINAL_ID_PROD = 123456789
URWAY_TERMINAL_ID_PROD= 123456789
URWAY_TERMINAL_ID_PROD =123456789
```

#### ج. تحقق من عدم وجود علامات اقتباس
```env
# صحيح
URWAY_TERMINAL_ID_PROD=123456789

# خطأ
URWAY_TERMINAL_ID_PROD="123456789"
URWAY_TERMINAL_ID_PROD='123456789'
```

### 4. إعادة تشغيل الخادم
```bash
# أوقف الخادم (Ctrl+C)
# ثم أعد تشغيله
npm run dev
```

### 5. اختبار سريع
افتح: `http://localhost:5000/test-urway-debug`

اضغط على "اختبار الاتصال" وتحقق من النتيجة.

## إذا استمرت المشكلة

### 1. تحقق من URWAY
- اذهب إلى [https://www.urway.sa](https://www.urway.sa)
- سجل دخول إلى لوحة التحكم
- تحقق من:
  - Terminal ID صحيح
  - Password صحيح
  - Secret Key صحيح
  - حالة الحساب (مفعل/غير مفعل)

### 2. تواصل مع دعم URWAY
إذا كانت البيانات صحيحة والحساب مفعل:
- البريد الإلكتروني: support@urway.sa
- اذكر لهم:
  - Terminal ID
  - نوع الخطأ (601)
  - أن الحساب مفعل

## تشخيص إضافي

### تحقق من سجلات الخادم
ابحث في terminal الخادم عن:
```
=== SENDING REQUEST TO URWAY ===
URL: https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest
Data being sent: {
  "trackId": "ORDER_...",
  "terminalId": "123456789",  // يجب أن يكون رقم وليس "lamar"
  "password": "***HIDDEN***",
  ...
}
```

### إذا كان terminalId لا يزال "lamar"
هذا يعني أن ملف `.env` لا يُقرأ بشكل صحيح. تحقق من:
1. وجود ملف `.env` في المجلد الرئيسي
2. صحة أسماء المتغيرات
3. عدم وجود أخطاء إملائية
4. إعادة تشغيل الخادم

## اختبار نهائي

بعد إصلاح البيانات، اختبر:

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

يجب أن تحصل على:
```json
{
  "success": true,
  "payid": "PAYMENT_ID",
  "paymentUrl": "https://payments.urway-tech.com/...",
  "message": "URWAY session created successfully"
}
```

## ملاحظات مهمة

1. **لا تشارك Secret Key مع أي شخص**
2. **تأكد من صحة البيانات قبل الاستخدام**
3. **اختبر في بيئة التطوير أولاً**
4. **احتفظ بنسخة احتياطية من البيانات**

## الدعم

إذا لم تحل المشكلة:
- توثيق URWAY: [https://www.urway.sa](https://www.urway.sa)
- فريق الدعم التقني: [support@urway.sa](mailto:support@urway.sa) 