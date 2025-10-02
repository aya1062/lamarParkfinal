## ARB Payment Gateway – Postman Test Guide

- Base URL (local backend): `http://localhost:5000/api`
- Auth: Header `Authorization: Bearer <token>` (optional in development)
- Sensitive values are read from `.env` (no hardcoding)

---

### 1) Initiate Payment (get ARB redirect URL)
- Method: POST
- URL: `/payments/initiate`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (optional in dev)
- Body (example; replace `property` with a valid ObjectId):
```json
{
  "property": "6865a2b4cb8c1498cf4ccaa4",
  "dates": { "checkIn": "2025-12-20", "checkOut": "2025-12-22", "nights": 2 },
  "guests": 2,
  "guest": { "name": "Test User", "email": "test@example.com", "phone": "0500000000" },
  "amount": 1000,
  "paymentMethod": "card"
}
```
- Success response:
```json
{
  "success": true,
  "redirectUrl": "https://securepayments.neoleap.com.sa/pg/payment/hosted.htm?paymentid=<PAYMENT_ID>",
  "bookingNumber": "LP123456"
}
```
- Error response (example):
```json
{
  "success": false,
  "message": "Invalid response from payment gateway",
  "details": "<raw gateway response – shown in non-production only>"
}
```
- Next step: open the `redirectUrl` in a browser to complete payment on ARB.

---

### 2) Success Callback (invoked by ARB)
- Method: GET or POST
- URL: `/payments/callback/success`
- Expected params (sent by ARB, examples):
  - `trackid=LP123456`
  - `paymentid=<PAYMENT_ID>`
  - `result=Successful`
- Server behavior:
  - Updates booking: `status=confirmed`, `paymentStatus=paid`, sets `payment.transactionId` and `payment.paymentDate`.
  - Redirects to: `FRONTEND_URL/booking/success?trackid=LP123456&result=successful`
- Manual simulation (GET):
```
http://localhost:5000/api/payments/callback/success?trackid=LP123456&paymentid=PID123&result=Successful
```

---

### 3) Error/Cancel Callback (invoked by ARB)
- Method: GET or POST
- URL: `/payments/callback/error`
- Expected params (examples):
  - `trackid=LP123456`
  - `paymentid=<PAYMENT_ID>`
  - `result=Failed`
- Server behavior:
  - Marks `payment.status=failed` (booking remains `pending`), then redirects to:
    - `FRONTEND_URL/booking/success?trackid=LP123456&result=failed`
- Manual simulation (GET):
```
http://localhost:5000/api/payments/callback/error?trackid=LP123456&paymentid=PID123&result=Failed
```

---

### 4) Fetch Booking by Booking Number
- Method: GET
- URL: `/bookings/number/:bookingNumber`
- Example:
```
GET /api/bookings/number/LP123456
```
- Sample response:
```json
{
  "success": true,
  "booking": {
    "_id": "...",
    "bookingNumber": "LP123456",
    "status": "confirmed",
    "paymentStatus": "paid",
    "amount": 1000,
    "payment": {
      "transactionId": "<PAYMENT_ID>",
      "status": "paid",
      "paymentDate": "2025-10-01T12:34:56.000Z"
    }
  }
}
```

---

### Test Card (Neoleap/ARB Test)
- Card Number: `5105105105105100`
- Expiry: `12/25`
- CVV: `123`
- OTP: `123123`
- Note: replace any “X” with `0` per the integration doc.

---

### Common Tips
- `property` must be a valid MongoDB ObjectId.
- Dates should be ISO-like strings, e.g. `"2025-12-20"`.
- If ARB cannot reach your localhost callbacks, use a tunneling tool and set `ARB_RESPONSE_URL` and `ARB_ERROR_URL` to the public tunnel URLs in `.env`.


