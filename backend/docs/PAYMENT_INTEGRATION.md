# ARB Payment Gateway Integration

## Overview

This document describes the Al Rajhi Bank (ARB/Neoleap) payment gateway integration implemented in this application using a simple, function-based approach.

## Architecture

### Payment Flow

1. **Payment Initiation** (`POST /api/payment/initiate`)
   - User requests to initiate a payment
   - Server validates request parameters using simple validation functions
   - Server generates encrypted payment token via ARB API using service functions
   - Server receives PaymentID from ARB
   - Server returns redirect URL to ARB hosted payment page

2. **User Payment** (ARB Hosted Page)
   - User is redirected to ARB's secure payment page
   - User enters card details and completes payment
   - ARB processes the payment

3. **Payment Callback** (`POST /api/payment/response`)
   - ARB calls back to our server with encrypted transaction result
   - Server decrypts and validates the response using utility functions
   - Server updates booking status if applicable
   - Server redirects user to success/failure page

## Simple Function-Based Design

The system uses simple, standalone functions instead of complex classes:

```javascript
// Simple service functions
const { generatePaymentToken, getDiagnosticInfo } = require('./services/ARBPaymentService');

// Simple configuration access
const config = require('./config');
const isConfigured = config.isARBConfigured();

// Direct function calls
const result = await generatePaymentToken({
  amount: "100.50",
  trackId: "BOOKING_12345"
});
```

## Service Functions

### `generatePaymentToken(paymentData)`
Main payment initiation function that handles the complete flow:
- Validates ARB configuration
- Encrypts transaction data 
- Calls ARB API
- Parses response
- Returns payment ID and redirect URL

### `getDiagnosticInfo()`
Returns sanitized configuration information for troubleshooting.

### Configuration Functions
- `config.get(key)` - Get configuration value
- `config.isARBConfigured()` - Check if ARB is properly set up
- `config.getSummary()` - Get configuration overview

## Configuration

### Environment Variables

```env
# ARB Gateway Configuration
ARB_TRANPORTAL_ID=your_terminal_id          # Terminal ID from ARB
ARB_TRANPORTAL_PASSWORD=your_password        # Password from ARB
ARB_RESOURCE_KEY=your_64_hex_resource_key   # AES encryption key (64 hex chars)
ARB_TRANPORTAL_URL=https://securepayments.neoleap.com.sa/pg/payment/hosted.htm
ARB_PAYMENT_URL=https://securepayments.neoleap.com.sa/pg/payment/hosted.htm

# Callback URLs (must be whitelisted with ARB)
ARB_RESPONSE_URL=https://yourdomain.com/api/payment/response
ARB_ERROR_URL=https://yourdomain.com/api/payment/response

# Application URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### ARB Merchant Portal Configuration

In your ARB merchant portal, whitelist the following callback URLs:
- Response URL: `https://yourdomain.com/api/payment/response`
- Error URL: `https://yourdomain.com/api/payment/response`

## API Endpoints

### POST /api/payment/initiate

Initiates a payment transaction.

**Request Body:**
```json
{
  "amount": "100.50",
  "trackId": "BOOKING_12345",
  "bookingId": "optional_booking_id"
}
```

**Response:**
```json
{
  "success": true,
  "redirectUrl": "https://securepayments.neoleap.com.sa/pg/payment/hosted.htm?PaymentID=123456789",
  "paymentId": "123456789",
  "message": "Payment token generated successfully"
}
```

### POST /api/payment/response

Handles ARB payment callbacks (both success and failure).

**Request Body:**
```json
{
  "trandata": "encrypted_transaction_result_from_arb"
}
```

**Response:**
- Redirects to frontend success/failure page based on payment result

### GET /api/payment/diagnose

Returns configuration diagnostic information.

**Response:**
```json
{
  "success": true,
  "config": {
    "tranportalIdMasked": "8x1c***eI",
    "passwordPresent": true,
    "resourceKeyInfo": {
      "length": 64,
      "hexLike": true
    },
    "tranportalUrl": "https://...",
    "paymentUrl": "https://...",
    "responseUrl": "https://...",
    "errorUrl": "https://..."
  },
  "warnings": [],
  "serviceInitialized": true
}
```

## Security

### Encryption

- **Algorithm**: AES-256-CBC
- **IV**: Fixed value "PGKEYENCDECIVSPC"
- **Key**: 32-byte key (provided as 64 hex characters)
- **Process**: URL-encode → AES encrypt → Uppercase HEX output

### Data Sanitization

All logging functions automatically sanitize sensitive data:
- Passwords are replaced with `[REDACTED]`
- Long HEX strings are truncated with `...[HEX]...`
- Full transaction data is never logged

## Testing

### Test Script

Use the provided test script to verify integration:

```bash
node backend/scripts/initiate-payment-test.js
```

### Manual Testing

1. **Configuration Check:**
   ```bash
   curl http://localhost:5000/api/payment/diagnose
   ```

2. **Payment Initiation:**
   ```bash
   curl -X POST http://localhost:5000/api/payment/initiate \
     -H "Content-Type: application/json" \
     -d '{"amount": "10.00", "trackId": "TEST_001"}'
   ```

3. **Configuration Validation:**
   ```bash
   node config/validate.js
   ```

## Benefits of Simple Function-Based Design

1. **Easy to Understand**: No complex class hierarchies or instantiation
2. **Direct Usage**: Import and call functions directly
3. **Less Overhead**: No object creation or method binding
4. **Simple Testing**: Easy to test individual functions
5. **Clear Dependencies**: Obvious what each function needs
6. **Straightforward Debugging**: Clear call stack and flow

## Code Structure

```
backend/
├── config/
│   ├── index.js          # Simple config functions
│   ├── validator.js      # Configuration validation
│   └── validate.js       # CLI validation tool
├── services/
│   └── ARBPaymentService.js  # Simple payment functions
├── controllers/
│   └── paymentController.js  # HTTP handlers using service functions
└── utils/
    └── arbPayment.js     # Core ARB utilities
```

## Service Layer

The payment service provides simple, focused functions:

```javascript
// services/ARBPaymentService.js
module.exports = {
  generatePaymentToken,    // Main payment function
  getDiagnosticInfo,       // Configuration diagnostics
  getCallbackUrls,         // URL generation
  buildEncryptedTransaction // Transaction encryption
};
```

This design eliminates complexity while maintaining all functionality.