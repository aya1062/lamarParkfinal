Dear Valued Customer,
=================================
Lamar Park – ARB/Neoleap Payment Integration (Test)
=================================

This document explains how to run ARB hosted payment flow locally using the provided test credentials. Nothing sensitive is hardcoded; all values are read from environment variables.

1) Backend configuration (.env)
---------------------------------
Create a backend .env file with the following keys (use your test values):

ARB_TRANPORTAL_ID=8x1cMK1v8t1KDeI
ARB_TRANPORTAL_PASSWORD=6G0al@w6Vw2RW$@
ARB_RESOURCE_KEY=52589146997352589146997352589146
ARB_TOKEN_URL=https://securepayments.neoleap.com.sa/pg/payment/tranportal.htm
ARB_RESPONSE_URL=http://localhost:5000/api/payments/callback/success
ARB_ERROR_URL=http://localhost:5000/api/payments/callback/error
FRONTEND_URL=http://localhost:5173

Also ensure Mongo and JWT:
MONGODB_URI=mongodb://localhost:27017/lamarPark
JWT_SECRET=your_jwt_secret_here
PORT=5000

2) Start services
------------------
- Terminal A (backend):
  npm install
  npm run dev   (or: node server.js)

- Terminal B (frontend):
  npm install
  npm run dev   (Vite on http://localhost:5173)

3) Payment flow overview
-------------------------
- Frontend `Checkout` lets user choose: cash on arrival or card.
- For card:
  a) Frontend calls POST /api/payments/initiate with booking details.
  b) Backend validates availability, creates a pending booking, generates gateway hash, calls ARB token endpoint, stores paymentId, and returns redirectUrl.
  c) Frontend redirects the browser to ARB hosted page.
  d) After user completes payment, ARB calls backend callback URLs:
     - Success → /api/payments/callback/success
     - Error/Cancel → /api/payments/callback/error
  e) Backend updates Mongo booking: success → status=confirmed, paymentStatus=paid; error → payment.status=failed.
  f) Backend redirects to FRONTEND_URL/booking/success?trackid=...&result=successful|failed
  g) Frontend `BookingSuccess` loads booking via trackid and shows final status.

4) Endpoints (backend)
----------------------
- POST /api/payments/initiate (auth optional in dev)
  Body:
  {
    property, dates:{checkIn,checkOut,nights}, guests, guest:{name,email,phone}, amount, specialRequests
  }
  Response:
  { success: true, redirectUrl, bookingNumber }

- GET/POST /api/payments/callback/success
  Query/body from ARB includes trackid/paymentid/result.
  Updates booking to paid/confirmed and redirects to FRONTEND_URL.

- GET/POST /api/payments/callback/error
  Marks booking payment.status=failed and redirects to FRONTEND_URL with failed result.

5) Testing with ARB test card
------------------------------
- Use card: replace X with 0 → 5105105105105100
- Expiry: 12/25
- CVV: 123
- OTP: 123123

6) Notes
--------
- We use `booking.bookingNumber` as `trackid` for reconciliation.
- Hash is computed using terminalId|password|trackid|amount|currency|secretKey (SHA-256).
- Amount is formatted with 2 decimals and currency SAR.
- All sensitive values are read from environment variables.

7) Troubleshooting
-------------------
- If redirectUrl is missing, check ARB_TOKEN_URL and credentials.
- Ensure backend can receive callbacks: with local dev, callbacks hit http://localhost:5000; use a tunneling tool if ARB cannot reach localhost.
- Verify CORS FRONTEND_URL matches your dev origin.

--- Original onboarding letter content below ---

      

Greetings from Neoleap!!

 

I would like to introduce myself as Technical Associate of Neoleap. We received your application form for neoleap Payment Gateway.

 

Please be informed that we have onboarded “ Lamar Park Company “as a merchant on Neoleap Payment Gateway Test environment. integration document will be share shortly, also please find below test credentials below for your reference. 

 

     Account Details:



 

 

 

 

 


العميل العزيز،

تحية طيبة من Neoleap،

نود أن نشكركم على اختياركم الانضمام إلى خدمة بوابة الدفع Neoleap.

يسعدنا إبلاغكم بأنه قد تم إنشاء حساب تجريبي للتاجر “Lamar Park Company” على بيئة الاختبار الخاصة ببوابة الدفع. وسيتم تزويدكم قريبًا بدليل التكامل (Integration Document) مع الأنظمة، كما تجدون أدناه بيانات الاعتماد الخاصة بالاختبار لاستخدامها في المرحلة التجريبية:

تفاصيل الحساب:

Field Name

Description

Terminal ID

PG367800

Terminal Name

Lamar Park Company

Merchant ID

600002488

Terminal Alias Name

PG367800

Merchant Control Panel Login URL

https://securepayments.alrajhibank.com.sa/mrchptl/merchant.htm

     Integration Credentials:

Field Name

Description

Tranportal ID

8x1cMK1v8t1KDeI

Tranportal Password

6G0al@w6Vw2RW$@

Terminal Resourcekey

52589146997352589146997352589146

End Point - URL's (Test Environment)

Bank Hosted /iFrame/ JSwidget Transactions:

https://securepayments.neoleap.com.sa/pg/payment/hosted.htm

Merchant Hosted/ Supporting Transaction:

https://securepayments.neoleap.com.sa/pg/payment/tranportal.htm

    Test Card Details:  

 

Card Number

Expiry

CVV

OTP

[please replace “X” with “0”]

51X51X51X51X51XX

12/25

123

123123

 

 

Thanks & Regards,

 

 

Field Name

PG367800

معرّف الجهاز

Lamar Park Company

اسم التاجر

600002488

رقم التاجر

PG367800

الاسم المختصر للجهاز

 

رابط الدخول للوحة تحكم التاجر

    

    

 

 

 

 

 

 

 

بيانات التكامل

 

Field Name

8x1cMK1v8t1KDeI

معرّف بوابة المعاملات

6G0al@w6Vw2RW$@

كلمة مرور بوابة المعاملات

52589146997352589146997352589146

مفتاح الحساب

 

روابط بيئة الاختبار:

 

 

 

 

 

 

 

 

 

 

بيانات البطاقة التجريبية

رمز التحقق لمرة واحدة (OTP):

رمز التحقق

تاريخ الانتهاء

رقم البطاقة:

123123

(CVV): 123

12/25

51X51X51X51X51XX

يرجى استبدال الحرف “X” بالرقم “0”

 

 

 

 

ملاحظة هامة:

هذه البيانات مخصّصة لبيئة الاختبار فقط، ولا يمكن استخدامها في العمليات المالية الفعلية. سيتم تزويدكم ببيانات الحساب الفعلي بعد استكمال خطوات التكامل

 

 

 

 

 

 

 



