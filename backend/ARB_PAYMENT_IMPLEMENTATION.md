## ARB/Neoleap Payment – Implementation Guide (for Developers)

This document summarizes the payment integration that is currently implemented, so another developer can maintain and extend it safely.

Scope implemented
- Hosted payment flow for property bookings (chalet/hotel properties).
- Backend creates pending `Booking`, requests ARB payment session, returns redirect URL.
- Frontend redirects user to ARB hosted payment page.
- Backend handles success/error callbacks, updates booking, and redirects to frontend confirmation page.
- Postman guide for QA is provided.

Recent changes (latest)
- Added `ARB_HOSTED_URL` env and fallback building of hosted redirect when gateway returns only `paymentId`.
- Broadened parsing to support fields like `PAYID`/`PAYMENT_URL`.
- Gateway request sends both JSON and `x-www-form-urlencoded` (auto-fallback on 415), and widens `Accept` headers to include `text/html`.
- Sends `udf5` containing the request hash (common ARB compatibility requirement).
- Initiate endpoint now returns `{ redirectUrl, targetUrl, paymentId }`; frontend falls back to POST form submit if GET redirect doesn’t render the hosted page.

Key files
- Backend
  - `backend/controllers/paymentController.js`: Initiation and callbacks (success/error) for ARB.
  - `backend/routes/paymentRoutes.js`: Payment endpoints, mounted under `/api/payments` in `backend/app.js`.
  - `backend/models/Booking.js`: Includes `payment` subdocument and `paymentMethod` enum (now includes `card`).
  - `backend/utils/urwayHash.js`: SHA-256 request hash generation helper (terminalId|password|trackid|amount|currency|secretKey).
  - `backend/env.example`: Required ARB keys and `FRONTEND_URL` placeholders.
  - `backend/POSTMAN_ARB_PAYMENTS.md`: Postman endpoints and sample payloads/responses.
- Frontend
  - `frontend/src/components/pages/Checkout.tsx`: Adds card option, calls payment initiate endpoint, redirects to ARB.
  - `frontend/src/components/pages/BookingSuccess.tsx`: Displays success/failure using `trackid` and `result` query params.
  - `frontend/src/utils/api.ts`: Adds `initiatePayment` client API.

Environment variables (backend .env)
- ARB_TRANPORTAL_ID
- ARB_TRANPORTAL_PASSWORD
- ARB_RESOURCE_KEY
- ARB_TOKEN_URL (test env example: `https://securepayments.neoleap.com.sa/pg/payment/tranportal.htm`)
- ARB_HOSTED_URL (test env example: `https://securepayments.neoleap.com.sa/pg/payment/hosted.htm`)
- ARB_RESPONSE_URL (e.g. `http://localhost:5000/api/payments/callback/success`)
- ARB_ERROR_URL (e.g. `http://localhost:5000/api/payments/callback/error`)
- FRONTEND_URL (e.g. `http://localhost:5173` or `http://localhost:3000`)
- MONGODB_URI, JWT_SECRET, PORT (standard app settings)

Backend endpoints
- POST `/api/payments/initiate`
  - Validates fields; checks availability via `checkAvailability`.
  - Creates pending `Booking` with `paymentMethod='card'`, `payment.status='pending'`.
  - Builds request hash and calls `ARB_TOKEN_URL` (tries JSON, falls back to x-www-form-urlencoded on 415).
  - Persists `payment.transactionId` (aka `paymentId`) if returned.
  - Returns: `{ success: true, redirectUrl, bookingNumber, targetUrl, paymentId }`.
- GET|POST `/api/payments/callback/success`
  - Expects ARB params (e.g., `trackid`, `paymentid`, `result`).
  - Finds booking by `bookingNumber` (used as `trackid`).
  - On success: sets `status='confirmed'`, `paymentStatus='paid'`, `payment.status='paid'`, `payment.paymentDate=now`, and stores `transactionId`.
  - Redirects to: `${FRONTEND_URL}/booking/success?trackid=<trackid>&result=successful`.
- GET|POST `/api/payments/callback/error`
  - Sets `payment.status='failed'` (booking itself remains `pending` by current business rule).
  - Redirects to: `${FRONTEND_URL}/booking/success?trackid=<trackid>&result=failed`.
- GET `/api/bookings/number/:bookingNumber`
  - Allows the frontend success page to fetch booking details by `trackid`.

Frontend flow (properties checkout)
1. User completes details on `Checkout.tsx` and chooses payment method.
2. For `cash_on_arrival`: creates booking directly.
3. For `card`: calls `api.initiatePayment(payload)` → receives `redirectUrl` (and `targetUrl`, `paymentId`). Primary flow: browser navigates to `redirectUrl`. Fallback: submit an auto-built POST form with `paymentid` to `targetUrl` to force rendering the hosted page.
4. After ARB completes, ARB calls backend callbacks → backend updates Mongo → redirects to `FRONTEND_URL/booking/success?trackid=...&result=...`.
5. `BookingSuccess.tsx` reads `trackid` and `result`, optionally fetches booking by number, and shows the final status.

Data model notes (Booking)
- `paymentMethod` enum now includes `'card'`.
- `payment` subdocument stores: `transactionId`, `amount`, `status ('pending'|'paid'|'failed')`, `paymentDate`, `paymentMethod` (string).
- `bookingNumber` is auto-generated (LPXXXXXX) and used as gateway `trackid`.

Error handling & gateway interop
- `initiatePayment` includes ENV validation and URL sanity checks; returns meaningful messages when misconfigured.
- Gateway request tries JSON first, then falls back to form-encoded if it receives 415 Unsupported Media Type.
- Response parsing supports JSON, querystring, or HTML forms to extract `targetUrl` and `paymentId`.
- Detects certain ARB error pages (e.g., InvalidAccess), typically indicating signature/parameter mismatch; request now includes `udf5` with hash to improve compatibility.

QA & manual testing
- Use `backend/POSTMAN_ARB_PAYMENTS.md` for exact Postman calls, payloads, and expected responses.
- For local callbacks, ensure ARB can reach your machine. If not, use a tunnel (e.g., ngrok) and set `ARB_RESPONSE_URL` and `ARB_ERROR_URL` to public tunnel URLs.
- In development, set `frontend/src/utils/api.ts` `API_URL` to `http://localhost:5000/api`.

Security and compliance
- No sensitive credentials are hardcoded; all are read from environment variables.
- Frontend never handles card data; ARB hosted page captures and processes all payment details.

Recommendations / Next work items
1. Verify ARB response authenticity
   - Validate gateway response signature/hash (e.g., `responseHash`) using `ARB_RESOURCE_KEY` in `handleSuccessCallback` before marking booking as paid.
2. Persist additional gateway metadata
   - Save fields like `authCode`, `result`, `tranid`, `ref`, `cardBrand`, etc., under `booking.payment` for auditing.
3. Amount & currency verification
   - Confirm paid amount/currency returned by ARB matches `booking.amount` before final confirmation.
4. Idempotency
   - Make callbacks idempotent to avoid race conditions on multiple gateway callbacks.
5. Failure policy
   - Decide whether to auto-cancel bookings on payment failure instead of leaving them `pending`.
6. Extend to room bookings
   - Mirror initiate/callback logic for `roomBooking` flow if card payments will be accepted there.
  - Callbacks are already compatible and update `RoomBooking` if `bookingNumber` matches; still needed: a room-specific initiate endpoint and frontend wiring if required.
7. Admin visibility
   - Add admin views/exports for payment statuses and gateway references.

Open items (blocking the card page render)
- Confirm exact token request fields/order per your ARB PDF/terminal. Some terminals require specific keys (e.g., `id`, `password`, `currencycode`, `langid`) and a particular hash composition.
- Verify sandbox credentials and that `ARB_TOKEN_URL` points to the correct environment for your terminal.
- If ARB still returns InvalidAccess HTML, capture the full raw token response (now logged in non-production) and align request fields accordingly.

Contact points in code
- To adjust request fields/signature: `paymentController.initiatePayment`.
- To enhance verification and persistence on success: `paymentController.handleSuccessCallback`.
- To alter failure handling: `paymentController.handleErrorCallback`.


