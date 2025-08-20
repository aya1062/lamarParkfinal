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
│   │   └── 📄 urway-test.js       # تكوين بوابة الدفع
│   │
│   ├── 📁 controllers/            # وحدات التحكم
│   │   ├── 📄 bookingController.js    # إدارة الحجوزات
│   │   ├── 📄 checkoutController.js   # إدارة الدفع
│   │   ├── 📄 paymentController.js    # معالجة المدفوعات
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
│   │   ├── 📄 checkoutRoutes.js   # مسارات الدفع
│   │   ├── 📄 contactRoutes.js    # مسارات التواصل
│   │   ├── 📄 paymentRoutes.js    # مسارات المدفوعات
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
│   │   └── 📄 urwayHash.js        # تشفير بوابة الدفع
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
│   │   ├── 📄 URWAY_ENVIRONMENT_FIX.md     # إصلاح بيئة بوابة الدفع
│   │   ├── 📄 URWAY_ERROR_601_SOLUTION.md  # حل خطأ 601
│   │   ├── 📄 URWAY_INTEGRATION.md         # دمج بوابة الدفع
│   │   ├── 📄 URWAY_QUICK_FIX_601.md       # إصلاح سريع لخطأ 601
│   │   ├── 📄 URWAY_SIMPLE_SETUP.md        # إعداد بسيط لبوابة الدفع
│   │   ├── 📄 URWAY_SOLUTION_GUIDE.md      # دليل حلول بوابة الدفع
│   │   └── 📄 URWAY_TROUBLESHOOTING.md     # استكشاف أخطاء بوابة الدفع
│   │
│   └── 📁 tests/                  # ملفات الاختبار
│       ├── 📄 simple-test.html    # اختبار بسيط
│       ├── 📄 test-direct-payment.html     # اختبار الدفع المباشر
│       ├── 📄 test-payment.html            # اختبار الدفع
│       ├── 📄 test-urway-config-check.html # فحص تكوين بوابة الدفع
│       ├── 📄 test-urway-config.html      # اختبار تكوين بوابة الدفع
│       ├── 📄 test-urway-debug.html       # تصحيح بوابة الدفع
│       ├── 📄 test-urway-direct.html      # اختبار بوابة الدفع المباشر
│       └── 📄 test-urway-settings.html    # اختبار إعدادات بوابة الدفع
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
- `/checkout/:id` - صفحة الدفع
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
- `/api/payments/*` - مسارات المدفوعات
- `/api/users/*` - مسارات المستخدمين

## 🛠️ التقنيات المستخدمة

### الخادم الخلفي
- Node.js + Express
- MongoDB + Mongoose
- JWT للمصادقة
- بوابة الدفع Urway

### الواجهة الأمامية
- React 18 + TypeScript
- Vite كأداة بناء
- Tailwind CSS للتصميم
- React Router للتنقل
- Zustand لإدارة الحالة

## 📱 الميزات الرئيسية

- نظام حجز العقارات (شاليهات وفنادق)
- نظام دفع إلكتروني
- لوحة إدارة للمشرفين
- لوحة تحكم للمستخدمين
- نظام أسعار ديناميكي
- إدارة الحجوزات والإلغاءات
- نظام مصادقة آمن
- واجهة مستخدم عربية RTL
