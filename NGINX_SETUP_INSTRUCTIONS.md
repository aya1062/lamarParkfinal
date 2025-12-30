# تعليمات إعداد Nginx لـ Hostinger VPS

## 📋 الخطوات المطلوبة

### 1. التحقق من موقع ملفات Nginx

عادة في Hostinger VPS:
```bash
# موقع ملفات الإعدادات
/etc/nginx/sites-available/  # الملفات المتاحة
/etc/nginx/sites-enabled/    # الملفات المفعلة (symlinks)
/etc/nginx/nginx.conf        # الملف الرئيسي
```

### 2. إنشاء ملف الإعدادات

```bash
# انتقل للمجلد
cd /etc/nginx/sites-available/

# أنشئ ملف جديد (أو عدّل الموجود)
sudo nano api.lamarparks.com.conf
```

**انسخ محتوى ملف `nginx-api.lamarparks.com.conf`** الذي أنشأناه في المشروع.

### 3. التحقق من رقم المنفذ (Port)

**مهم جداً**: تأكد من أن Node.js server يعمل على المنفذ الصحيح.

```bash
# تحقق من المنفذ في backend/server.js
# عادة يكون 5000 أو PORT من environment variable
```

إذا كان المنفذ مختلف، غيّر في ملف Nginx:
```nginx
proxy_pass http://localhost:YOUR_PORT;
```

### 4. إنشاء Symlink (ربط)

```bash
# أنشئ رابط رمزي
sudo ln -s /etc/nginx/sites-available/api.lamarparks.com.conf /etc/nginx/sites-enabled/api.lamarparks.com.conf
```

### 5. التحقق من صحة الإعدادات

```bash
# تحقق من صحة ملفات Nginx
sudo nginx -t
```

**يجب أن ترى**:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 6. إعادة تحميل Nginx

```bash
# إعادة تحميل Nginx (بدون إيقاف)
sudo systemctl reload nginx

# أو إعادة التشغيل الكامل
sudo systemctl restart nginx
```

### 7. التحقق من الحالة

```bash
# تحقق من حالة Nginx
sudo systemctl status nginx

# تحقق من الـ logs
sudo tail -f /var/log/nginx/api.lamarparks.com.error.log
```

---

## 🔍 التحقق من Cloudflare

### إذا كان `api.lamarparks.com` يمر عبر Cloudflare:

1. **سجّل دخول لـ Cloudflare Dashboard**
2. **اختر domain**: `lamarparks.com`
3. **اذهب لـ DNS Settings**
4. **تحقق من**:
   - هل `api.lamarparks.com` موجود في DNS records؟
   - هل الـ Proxy (السحابة البرتقالية) مفعلة؟

### إذا كان Cloudflare مفعل:

**الخيار 1: تعطيل Cloudflare للـ API subdomain**
- في DNS settings، اضغط على السحابة البرتقالية بجانب `api.lamarparks.com`
- اجعلها رمادية (DNS only) - هذا سيعطل Cloudflare proxy

**الخيار 2: إعدادات Cloudflare**
- اذهب لـ **Rules** → **Page Rules**
- أنشئ rule جديد:
  - URL: `api.lamarparks.com/*`
  - Settings: 
    - **Cache Level**: Bypass
    - **Security Level**: Medium
    - **Disable Performance**: ON

---

## 🧪 اختبار الإعدادات

### 1. اختبار من Terminal

```bash
# اختبار CORS
curl -X OPTIONS https://api.lamarparks.com/api/properties \
  -H "Origin: https://lamarparks.com" \
  -H "Access-Control-Request-Method: PUT" \
  -v

# يجب أن ترى:
# < Access-Control-Allow-Origin: https://lamarparks.com
```

### 2. اختبار من Browser Console

افتح Developer Console وجرب:
```javascript
fetch('https://api.lamarparks.com/api/properties', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://lamarparks.com'
  }
}).then(r => console.log(r.headers.get('Access-Control-Allow-Origin')));
```

### 3. اختبار رفع الصور

جرب رفع صورة من Admin Panel - يجب أن تعمل الآن!

---

## ⚠️ مشاكل محتملة وحلولها

### المشكلة 1: "nginx: command not found"
**الحل**: Nginx غير مثبت
```bash
sudo apt update
sudo apt install nginx
```

### المشكلة 2: "Permission denied"
**الحل**: استخدم `sudo` مع جميع الأوامر

### المشكلة 3: "Port already in use"
**الحل**: تحقق من المنفذ في `proxy_pass`
```bash
# تحقق من المنفذ المستخدم
sudo netstat -tulpn | grep :5000
```

### المشكلة 4: "502 Bad Gateway"
**الحل**: 
- تحقق من أن Node.js server يعمل
- تحقق من المنفذ في `proxy_pass`
- تحقق من الـ logs: `sudo tail -f /var/log/nginx/error.log`

### المشكلة 5: CORS لا يزال لا يعمل
**الحل**:
- تأكد من أن Origin في Nginx config يطابق `https://lamarparks.com` بالضبط
- تحقق من Cloudflare settings
- تحقق من Express CORS config

---

## 📝 ملاحظات مهمة

1. **بعد أي تعديل في Nginx**: دائماً استخدم `sudo nginx -t` قبل `reload`
2. **الـ logs**: راجع `/var/log/nginx/` للمساعدة في debugging
3. **Security**: تأكد من أن SSL certificate صحيح إذا كنت تستخدم HTTPS
4. **Backup**: احتفظ بنسخة من الإعدادات القديمة قبل التعديل

---

## ✅ Checklist

- [ ] ملف Nginx config تم إنشاؤه
- [ ] Symlink تم إنشاؤه
- [ ] `nginx -t` نجح بدون أخطاء
- [ ] Nginx تم إعادة تحميله
- [ ] Node.js server يعمل على المنفذ الصحيح
- [ ] CORS test نجح
- [ ] رفع الصور يعمل

---

## 🆘 إذا استمرت المشكلة

1. **تحقق من الـ logs**:
   ```bash
   sudo tail -50 /var/log/nginx/api.lamarparks.com.error.log
   sudo tail -50 /var/log/nginx/error.log
   ```

2. **تحقق من Node.js logs**:
   ```bash
   # في مجلد backend
   pm2 logs
   # أو
   journalctl -u your-node-service -n 50
   ```

3. **تحقق من Cloudflare**:
   - هل الـ proxy مفعل؟
   - ما هو الـ plan المستخدم؟

4. **اختبار مباشر**:
   ```bash
   # من الـ VPS نفسه
   curl -X PUT http://localhost:5000/api/properties/test \
     -H "Content-Type: multipart/form-data" \
     -F "test=test"
   ```





