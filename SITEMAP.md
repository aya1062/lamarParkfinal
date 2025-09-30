# خريطة الموقع - لامار بارك

## 📁 هيكل المشروع

```
lamarPark - server/
├── 📁 backend/                    # الخادم الخلفي (Node.js + Express)
│   ├── 📄 app.js                  # التطبيق الرئيسي
│   ├── 📄 server.js               # خادم HTTP
│   ├── 📄 package.json            # تبعيات المشروع
│   ├── 📄 package-lock.json       # قفل الإصدارات
│   ├── 📄 Procfile                # تكوين Heroku
│   │
│   ├── 📁 config/                 # ملفات التكوين
│   │   ├── 📄 db.js               # تكوين قاعدة البيانات
│   │   
│   │
│   ├── 📁 controllers/            # وحدات التحكم
│   │   ├── 📄 bookingController.js    # إدارة الحجوزات
│   │   
│   │   ├── 📄 pricingController.js    # إدارة الأسعار
│   │   ├── 📄 propertyController.js   # إدارة العقارات
│   │   ├── 📄 settingsController.js   # إعدادات النظام
│   │   ├── 📄 urwayController.js      # بوابة الدفع
│   │   └── 📄 userController.js       # إدارة المستخدمين
│   │
│   ├── 📁 middleware/             # الوسائط البرمجية
│   │   └── 📄 authMiddleware.js   # مصادقة المستخدمين
│   │
│   ├── 📁 models/                 # نماذج قاعدة البيانات
│   │   ├── 📄 Booking.js          # نموذج الحجوزات
│   │   ├── 📄 Payment.js          # نموذج المدفوعات
│   │   ├── 📄 Pricing.js          # نموذج الأسعار
│   │   ├── 📄 Property.js         # نموذج العقارات
│   │   ├── 📄 Settings.js         # نموذج الإعدادات
│   │   └── 📄 User.js             # نموذج المستخدمين
│   │
│   ├── 📁 routes/                 # مسارات API
│   │   ├── 📄 authRoutes.js       # مسارات المصادقة
│   │   ├── 📄 bookingRoutes.js    # مسارات الحجوزات
│   │   ├── 📄 contactRoutes.js    # مسارات التواصل
│   │   ├── 📄 pricingRoutes.js    # مسارات الأسعار
│   │   ├── 📄 propertyRoutes.js   # مسارات العقارات
│   │   ├── 📄 settingsRoutes.js   # مسارات الإعدادات
│   │   ├── 📄 urwayRoutes.js      # مسارات بوابة الدفع
│   │   └── 📄 userRoutes.js       # مسارات المستخدمين
│   │
│   ├── 📁 scripts/                # سكريبتات مساعدة
│   │   ├── 📄 markFeatured.js     # تحديد العقارات المميزة
│   │   └── 📄 setup.js            # إعداد المشروع
│   │
│   ├── 📁 utils/                  # أدوات مساعدة
│   │   
│   │
│   ├── 📁 docs/                   # الوثائق
│   │   ├── 📄 CHANGELOG.md        # سجل التغييرات
│   │   ├── 📄 COMPLETE_SETUP_GUIDE.md  # دليل الإعداد الكامل
│   │   ├── 📄 Lamar_API_Documentation.txt  # وثائق API
│   │   ├── 📄 QUICK_FIX_INSTRUCTIONS.md    # تعليمات الإصلاح السريع
│   │   ├── 📄 QUICK_TEST_GUIDE.md          # دليل الاختبار السريع
│   │   ├── 📄 README.md            # دليل المشروع
│   │   ├── 📄 SETUP_GUIDE.md       # دليل الإعداد
│   │   ├── 📄 START_COMMANDS.md    # أوامر التشغيل
│   │   ├── 📄 TESTING_INSTRUCTIONS.md      # تعليمات الاختبار
│   │   
│   │
│   └── 📁 tests/                  # ملفات الاختبار
│       ├── 📄 simple-test.html    # اختبار بسيط
│       
│
├── 📁 frontend/                   # الواجهة الأمامية (React + TypeScript)
│   ├── 📄 package.json            # تبعيات الواجهة
│   ├── 📄 package-lock.json       # قفل الإصدارات
│   ├── 📄 index.html              # الصفحة الرئيسية
│   ├── 📄 vite.config.ts          # تكوين Vite
│   ├── 📄 tailwind.config.js      # تكوين Tailwind CSS
│   ├── 📄 tsconfig.json           # تكوين TypeScript
│   ├── 📄 eslint.config.js        # تكوين ESLint
│   ├── 📄 postcss.config.js       # تكوين PostCSS
│   ├── 📄 vitest.config.ts        # تكوين Vitest للاختبارات
│   │
│   ├── 📁 public/                 # الملفات العامة
│   │   ├── 📁 imageProperety/     # صور العقارات
│   │   │   ├── 📄 logo.png        # الشعار
│   │   │   └── 📄 logo2.png       # الشعار البديل
│   │   └── 📁 lamar/              # صور لامار بارك
│   │       ├── 📄 صوره بروفيل لامار بارك  .png
│   │       └── 📄 لوجو بدون خلفيه .png
│   │
│   ├── 📁 src/                    # الكود المصدري
│   │   ├── 📄 main.tsx            # نقطة الدخول
│   │   ├── 📄 App.tsx             # التطبيق الرئيسي
│   │   ├── 📄 index.css           # الأنماط الرئيسية
│   │   ├── 📄 vite-env.d.ts       # أنواع Vite
│   │   │
│   │   ├── 📁 components/         # المكونات
│   │   │   ├── 📁 admin/          # مكونات الإدارة
│   │   │   │   ├── 📄 AdminAccountManagement.tsx  # إدارة الحسابات
│   │   │   │   ├── 📄 AdminBookings.tsx           # إدارة الحجوزات
│   │   │   │   ├── 📄 AdminDashboard.tsx          # لوحة الإدارة
│   │   │   │   ├── 📄 AdminPayments.tsx           # إدارة المدفوعات
│   │   │   │   ├── 📄 AdminPricing.tsx            # إدارة الأسعار
│   │   │   │   ├── 📄 AdminProperties.tsx         # إدارة العقارات
│   │   │   │   ├── 📄 AdminSettings.tsx           # إعدادات الإدارة
│   │   │   │   └── 📄 AdminUsers.tsx              # إدارة المستخدمين
│   │   │   │
│   │   │   ├── 📁 common/         # مكونات مشتركة
│   │   │   │   ├── 📄 ErrorBoundary.tsx           # معالج الأخطاء
│   │   │   │   ├── 📄 FloatingContact.tsx         # نموذج التواصل العائم
│   │   │   │   ├── 📄 LoadingSpinner.tsx          # مؤشر التحميل
│   │   │   │   ├── 📄 PrivateRoute.tsx             # المسار المحمي
│   │   │   │   └── 📄 Toast.tsx                   # إشعارات النظام
│   │   │   │
│   │   │   ├── 📁 layout/         # مكونات التخطيط
│   │   │   │   ├── 📄 Footer.tsx                  # التذييل
│   │   │   │   └── 📄 Navbar.tsx                  # شريط التنقل
│   │   │   │
│   │   │   ├── 📁 pages/          # صفحات التطبيق
│   │   │   │   ├── 📄 About.tsx                   # صفحة من نحن
│   │   │   │   ├── 📄 Booking.tsx                 # صفحة الحجز
│   │   │   │   ├── 📄 BookingSuccess.tsx          # نجاح الحجز
│   │   │   │   ├── 📄 Chalets.tsx                 # صفحة الشاليهات
│   │   │   │   ├── 📄 Checkout.tsx                 # صفحة الدفع
│   │   │   │   ├── 📄 Contact.tsx                  # صفحة التواصل
│   │   │   │   ├── 📄 Home.tsx                     # الصفحة الرئيسية
│   │   │   │   ├── 📄 Hotels.tsx                   # صفحة الفنادق
│   │   │   │   ├── 📄 Login.tsx                    # صفحة تسجيل الدخول
│   │   │   │   ├── 📄 NotFound.tsx                 # صفحة 404
│   │   │   │   ├── 📄 Payment.tsx                  # صفحة الدفع
│   │   │   │   ├── 📄 PaymentResponse.tsx          # استجابة الدفع
│   │   │   │   ├── 📄 PaymentTest.tsx              # اختبار الدفع
│   │   │   │   ├── 📄 Policies.tsx                 # صفحة السياسات
│   │   │   │   ├── 📄 PropertyDetails.tsx          # تفاصيل العقار
│   │   │   │   ├── 📄 Register.tsx                 # صفحة التسجيل
│   │   │   │   └── 📄 UserDashboard.tsx            # لوحة المستخدم
│   │   │   │
│   │   │   ├── 📁 sections/       # أقسام الصفحات
│   │   │   │   ├── 📄 AboutSection.tsx             # قسم من نحن
│   │   │   │   ├── 📄 FeaturedProperties.tsx       # العقارات المميزة
│   │   │   │   ├── 📄 Hero.tsx                     # القسم الرئيسي
│   │   │   │   ├── 📄 HotelProperties.tsx          # عقارات الفنادق
│   │   │   │   └── 📄 Testimonials.tsx             # التوصيات
│   │   │   │
│   │   │   └── 📁 shared/         # مكونات مشتركة
│   │   │       └── 📄 PropertyCard.tsx             # بطاقة العقار
│   │   │
│   │   ├── 📁 data/               # البيانات
│   │   │   └── 📄 mockData.ts     # بيانات تجريبية
│   │   │
│   │   ├── 📁 hooks/              # Hooks مخصصة
│   │   │   └── 📄 useFormValidation.ts             # التحقق من النماذج
│   │   │
│   │   ├── 📁 store/              # إدارة الحالة
│   │   │   ├── 📄 authStore.ts                     # حالة المصادقة
│   │   │   └── 📄 bookingStore.ts                  # حالة الحجوزات
│   │   │
│   │   ├── 📁 utils/              # أدوات مساعدة
│   │   │   └── 📄 api.ts                           # واجهة API
│   │   │
│   │   └── 📁 test/                # الاختبارات
│   │       ├── 📁 components/      # اختبارات المكونات
│   │       │   ├── 📄 Login.test.tsx               # اختبار تسجيل الدخول
│   │       │   └── 📄 PropertyCard.test.tsx        # اختبار بطاقة العقار
│   │       └── 📄 setup.ts                         # إعداد الاختبارات
│   │
│   └── 📁 docs/                   # وثائق الواجهة (إن وجدت)
│
└── 📄 README.md                   # دليل المشروع الرئيسي
```

## 🚀 كيفية التشغيل

### الخادم الخلفي (Backend)
```bash
cd backend
npm install
npm start
```

### الواجهة الأمامية (Frontend)
```bash
cd frontend
npm install
npm run dev
```

## 🔗 المسارات الرئيسية

### الواجهة الأمامية
- `/` - الصفحة الرئيسية
- `/chalets` - الشاليهات
- `/hotels` - الفنادق
- `/property/:id` - تفاصيل العقار
- `/booking/:id` - صفحة الحجز
- (تم إيقاف صفحة الدفع مؤقتاً)
- `/policies` - سياسات الحجز والإلغاء
- `/about` - من نحن
- `/contact` - التواصل
- `/login` - تسجيل الدخول
- `/register` - إنشاء حساب
- `/dashboard` - لوحة المستخدم
- `/admin` - لوحة الإدارة

### API الخادم الخلفي
- `/api/auth/*` - مسارات المصادقة
- `/api/properties/*` - مسارات العقارات
- `/api/bookings/*` - مسارات الحجوزات
 
- `/api/users/*` - مسارات المستخدمين

## 🛠️ التقنيات المستخدمة

### الخادم الخلفي
- Node.js + Express
- MongoDB + Mongoose
- JWT للمصادقة
 

### الواجهة الأمامية
- React 18 + TypeScript
- Vite كأداة بناء
- Tailwind CSS للتصميم
- React Router للتنقل
- Zustand لإدارة الحالة

## 📱 الميزات الرئيسية

- نظام حجز العقارات (شاليهات وفنادق)
 
- لوحة إدارة للمشرفين
- لوحة تحكم للمستخدمين
- نظام أسعار ديناميكي
- إدارة الحجوزات والإلغاءات
- نظام مصادقة آمن
- واجهة مستخدم عربية RTL
