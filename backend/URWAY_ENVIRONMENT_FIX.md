# حل مشكلة بيئة URWAY

## المشكلة
أنت وضعت بيانات **PRODUCTION** في ملف `.env`:
- `URWAY_TERMINAL_ID_PROD`
- `URWAY_PASSWORD_PROD` 
- `URWAY_SECRET_KEY_PROD`

لكن الكود يتحقق من `NODE_ENV` لتحديد البيئة.

## الحل

### الخيار 1: استخدام بيئة Production
إذا تريد استخدام بيانات Production، غير `NODE_ENV` في ملف `.env`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lamarPark

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=production  # ← غير هذا إلى production

# URWAY Payment Gateway Configuration
URWAY_TERMINAL_ID_PROD=your_production_terminal_id
URWAY_PASSWORD_PROD=your_production_password
URWAY_SECRET_KEY_PROD=your_production_secret_key
```

### الخيار 2: استخدام بيانات Test
إذا تريد استخدام بيئة Test، أضف بيانات Test في ملف `.env`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lamarPark

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development  # ← اترك هذا development

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

## كيف يعمل الكود

```javascript
// تحديد البيئة
const isProduction = process.env.NODE_ENV === 'production';

// اختيار البيانات حسب البيئة
const URWAY_CONFIG = {
  terminalId: isProduction ? URWAY_TERMINAL_ID_PROD : URWAY_TERMINAL_ID_TEST,
  password: isProduction ? URWAY_PASSWORD_PROD : URWAY_PASSWORD_TEST,
  secretKey: isProduction ? URWAY_SECRET_KEY_PROD : URWAY_SECRET_KEY_TEST,
  baseUrl: isProduction 
    ? 'https://payments.urway-tech.com/URWAYPGService'  // Production URL
    : 'https://payments-dev.urway-tech.com/URWAYPGService'  // Test URL
};
```

## اختبار الإعدادات

1. **أعد تشغيل الخادم**:
   ```bash
   npm run dev
   ```

2. **افتح صفحة فحص الإعدادات**:
   ```
   http://localhost:5000/test-urway-config-check
   ```

3. **تحقق من النتائج**:
   - إذا كان `NODE_ENV=production`: سيستخدم بيانات `*_PROD`
   - إذا كان `NODE_ENV=development`: سيستخدم بيانات `*_TEST`

## ملاحظات مهمة

### ⚠️ تحذير: بيئة Production
إذا اخترت `NODE_ENV=production`:
- ستستخدم **معاملات حقيقية**
- ستخصم **مبالغ حقيقية**
- تأكد من صحة البيانات

### ✅ توصية: بيئة Test
للاختبار، استخدم `NODE_ENV=development` مع بيانات Test:
- معاملات تجريبية
- لا تخصم مبالغ حقيقية
- آمن للاختبار

## استكشاف الأخطاء

### إذا ظهر "NOT SET" لبيئة Production:
1. تأكد من `NODE_ENV=production`
2. تأكد من وجود `URWAY_*_PROD` في ملف `.env`
3. أعد تشغيل الخادم

### إذا ظهر "NOT SET" لبيئة Test:
1. تأكد من `NODE_ENV=development`
2. تأكد من وجود `URWAY_*_TEST` في ملف `.env`
3. أعد تشغيل الخادم

## مثال ملف .env كامل

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lamarPark

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development  # أو production

# URWAY Payment Gateway Configuration
# Test Environment
URWAY_TERMINAL_ID_TEST=test_terminal_123
URWAY_PASSWORD_TEST=test_password_123
URWAY_SECRET_KEY_TEST=test_secret_key_123

# Production Environment
URWAY_TERMINAL_ID_PROD=prod_terminal_456
URWAY_PASSWORD_PROD=prod_password_456
URWAY_SECRET_KEY_PROD=prod_secret_key_456
``` 