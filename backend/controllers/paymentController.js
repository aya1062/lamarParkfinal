/**
 * Payment Controller
 * 
 * Handles ARB (Al Rajhi Bank) payment gateway integration including:
 * - Payment initiation with token generation
 * - Payment response callbacks from ARB
 * - Configuration diagnostics
 * 
 * @module PaymentController
 * @requires axios
 * @requires qs
 * @requires cheerio
 * @requires fs
 * @requires path
 * @requires ../utils/arbPayment
 * @requires ../models/Booking
 * @requires ../services/ARBPaymentService
 */

const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const {
  encryptAES,
  decryptAES,
  buildTransactionData,
  parseARBResponse,
  isPaymentSuccessful
} = require('../utils/arbPayment');
const Booking = require('../models/Booking');
const { generatePaymentToken, getDiagnosticInfo } = require('../services/ARBPaymentService');

/**
 * Sanitize logs to avoid leaking secrets (password/trandata)
 * @private
 * @param {*} input - Input to sanitize (string, object, etc.)
 * @returns {string} Sanitized string safe for logging
 */
function sanitizeForLogs(input) {
  try {
    let s = (typeof input === 'string') ? input : JSON.stringify(input);
    s = s.replace(/([A-Fa-f0-9]{40,})/g, (m) => m.substring(0,20) + '...[HEX]...' + m.substring(m.length-20));
    s = s.replace(/(\"password\"\s*:\s*\")[^\"\n]+(\"?)/ig, '$1[REDACTED]$2');
    s = s.replace(/(password=)[^&\s]+/ig, '$1[REDACTED]');
    return s;
  } catch (e) { return '[unavailable]'; }
}

/**
 * Validate payment initiation request parameters
 * 
 * @private
 * @param {Object} body - Request body from client
 * @param {string|number} body.amount - Payment amount (must be positive number)
 * @param {string} body.trackId - Unique tracking identifier
 * @param {string} [body.bookingId] - Optional booking reference
 * @returns {{isValid: boolean, error?: string, data?: Object}} Validation result
 * 
 * @example
 * const validation = validatePaymentRequest({
 *   amount: "100.50",
 *   trackId: "BOOKING_12345",
 *   bookingId: "optional_id"
 * });
 * if (!validation.isValid) {
 *   return res.status(400).json({ message: validation.error });
 * }
 */
function validatePaymentRequest(body) {
  const { amount, trackId, bookingId } = body;

  if (!amount || !trackId) {
    return {
      isValid: false,
      error: 'Amount and trackId are required'
    };
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return {
      isValid: false,
      error: 'Amount must be a positive number'
    };
  }

  if (typeof trackId !== 'string' || trackId.trim().length === 0) {
    return {
      isValid: false,
      error: 'TrackId must be a non-empty string'
    };
  }

  return {
    isValid: true,
    data: {
      amount: numericAmount.toFixed(2),
      trackId: trackId.trim(),
      bookingId: bookingId || null
    }
  };
}

/**
 * POST /api/payment/initiate
 * 
 * Initiates ARB payment by generating a payment token and returning redirect URL.
 * This endpoint validates the payment request, generates an encrypted payment token
 * via ARB's API, and returns a redirect URL to ARB's hosted payment page.
 * 
 * @async
 * @function initiatePayment
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string|number} req.body.amount - Payment amount in SAR (must be positive)
 * @param {string} req.body.trackId - Unique tracking identifier for the transaction
 * @param {string} [req.body.bookingId] - Optional booking ID for reference
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} JSON response with redirect URL or error
 * 
 * @example
 * // Request
 * POST /api/payment/initiate
 * Content-Type: application/json
 * {
 *   "amount": "100.50",
 *   "trackId": "BOOKING_12345",
 *   "bookingId": "booking_001"
 * }
 * 
 * // Success Response
 * {
 *   "success": true,
 *   "redirectUrl": "https://securepayments.neoleap.com.sa/pg/payment/hosted.htm?PaymentID=123456789",
 *   "paymentId": "123456789",
 *   "message": "Payment token generated successfully"
 * }
 * 
 * // Error Response
 * {
 *   "success": false,
 *   "message": "Amount must be a positive number"
 * }
 */
exports.initiatePayment = async (req, res) => {
  try {
    // Validate request
    const validation = validatePaymentRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const { amount, trackId, bookingId } = validation.data;

    // Generate payment token using ARB service
    console.log(`🔄 Initiating payment: ${amount} SAR for track ${trackId}`);
    
    let paymentResult;
    try {
      paymentResult = await generatePaymentToken({
        amount,
        trackId,
        bookingId
      });
      
      console.log(`✅ Payment token generated: PaymentID ${paymentResult.paymentId}`);
    } catch (arbError) {
      console.error('❌ ARB payment token generation failed:', arbError.message);
      
      // Save error details for support if needed
      try {
        const logsDir = path.join(__dirname, '..', 'logs');
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
        const errorFile = path.join(logsDir, `arb-error-${Date.now()}.json`);
        fs.writeFileSync(errorFile, JSON.stringify({
          timestamp: new Date().toISOString(),
          error: arbError.message,
          trackId,
          amount
        }, null, 2));
        console.log(`📁 Error details saved to: ${errorFile}`);
      } catch (logError) {
        console.error('Failed to save error log:', logError.message);
      }

      return res.status(502).json({
        success: false,
        message: 'Payment gateway error',
        error: process.env.NODE_ENV === 'development' ? arbError.message : 'Unable to process payment request'
      });
    }

    // Return successful payment initiation response
    return res.json({
      success: true,
      redirectUrl: paymentResult.redirectUrl,
      paymentId: paymentResult.paymentId,
      message: 'Payment token generated successfully'
    });

  } catch (error) {
    console.error('Payment initiation error:', error.message);
    if (error.response) {
      console.error('ARB Error Response:', error.response.data);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
};

/**
 * POST /api/payment/response
 * 
 * Handles ARB payment callback responses for both successful and failed transactions.
 * This endpoint receives encrypted transaction results from ARB, decrypts them,
 * validates the payment status, updates booking records if applicable, and redirects
 * the user to the appropriate success or failure page.
 * 
 * @async
 * @function handlePaymentResponse
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body from ARB
 * @param {string} req.body.trandata - Encrypted transaction result from ARB
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Redirects to success/failure page or returns error JSON
 * 
 * @example
 * // ARB calls this endpoint after payment completion:
 * POST /api/payment/response
 * Content-Type: application/x-www-form-urlencoded
 * trandata=4A2F8B9C1D3E5F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A...
 * 
 * // Successful payment -> redirect to success page
 * // Failed payment -> redirect to failure page with error details
 */
exports.handlePaymentResponse = async (req, res) => {
  try {
    // Diagnostic: log incoming request metadata to help debug ARB callbacks
    try {
      console.log('Received ARB callback: method=', req.method, 'url=', req.originalUrl, 'ip=', req.ip);
      console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    } catch (e) {}

    const { trandata } = req.body;
    console.log('Request Content-Type:', req.headers['content-type']);
    if (trandata) {
      const t = String(trandata);
      console.log('Received trandata length:', t.length, 'head=', t.substring(0, 60), 'tail=', t.substring(Math.max(0, t.length - 60)));
    } else {
      console.log('No trandata found in req.body. Body keys:', Object.keys(req.body || {}));
    }

    if (!trandata) {
      console.error('No trandata in payment response');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/error?reason=invalid`);
    }

    const resourceKey = process.env.ARB_RESOURCE_KEY;

    // Decrypt the response
  const decrypted = decryptAES(trandata, resourceKey);
  console.log('Decrypted ARB Response (first 2000 chars):', decrypted.substring(0, 2000));

    // Parse the response
    const paymentData = parseARBResponse(decrypted);
    console.log('Parsed Payment Data:', paymentData);

    // Extract key fields (field names may vary - ARB uses both lowercase and camelCase)
    const result = paymentData.result || paymentData.Result;
    const paymentId = paymentData.paymentid || paymentData.PaymentID || paymentData.paymentId;
    const trackId = paymentData.trackid || paymentData.TrackID || paymentData.trackId;
    const transId = paymentData.tranid || paymentData.TranID || paymentData.transId;
    const ref = paymentData.ref || paymentData.Ref;
    const amount = paymentData.amt || paymentData.Amt;
    const authRespCode = paymentData.authRespCode || paymentData.auth;
    const bookingId = paymentData.udf1 || paymentData.UDF1;

    // Check if payment was successful
    if (isPaymentSuccessful(paymentData)) {
      console.log('✅ Payment successful:', {
        paymentId,
        trackId,
        transId,
        amount,
        ref
      });

      // Update booking status if bookingId is provided
      if (bookingId) {
        try {
          await Booking.findByIdAndUpdate(bookingId, {
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentDetails: {
              method: 'arb',
              paymentId,
              transactionId: transId,
              referenceNumber: ref,
              amount: parseFloat(amount),
              paidAt: new Date()
            }
          });
          console.log('✅ Booking updated:', bookingId);
        } catch (dbError) {
          console.error('Failed to update booking:', dbError);
        }
      }

      // Redirect to success page with payment details
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?` +
        `paymentId=${paymentId}&trackId=${trackId}&amount=${amount}&ref=${ref}`
      );
    } else {
      console.log('❌ Payment failed or declined:', {
        result,
        authRespCode,
        paymentId,
        trackId
      });

      // Redirect to error page with failure details
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/error?` +
        `reason=${result || 'declined'}&trackId=${trackId}`
      );
    }

  } catch (error) {
    console.error('Payment response handling error:', error);
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/error?reason=system_error`
    );
  }
};

/**
 * GET /api/payment/error
 * Redirects browser to frontend error page with optional reason/trackId query params
 */
exports.handlePaymentError = (req, res) => {
  try {
    const reason = req.query.reason || req.body?.reason || 'declined';
    const trackId = req.query.trackId || req.body?.trackId || '';
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontend}/payment/error?reason=${encodeURIComponent(reason)}${trackId ? `&trackId=${encodeURIComponent(trackId)}` : ''}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Error handling payment error redirect:', err);
    return res.status(500).send('Error processing payment response');
  }
};

/**
 * GET /api/payment/verify/:trackId
 * Verify payment status for a given track ID
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { trackId } = req.params;

    // Find booking by track ID
    const booking = await Booking.findOne({ bookingNumber: trackId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      paymentDetails: booking.paymentDetails
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

/**
 * GET /api/payment/diagnose
 * 
 * Returns diagnostic information about ARB payment gateway configuration.
 * This endpoint provides sanitized configuration details, validation warnings,
 * and service initialization status to help troubleshoot integration issues.
 * 
 * @function diagnose
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with configuration status and warnings
 * 
 * @example
 * // Request
 * GET /api/payment/diagnose
 * 
 * // Response
 * {
 *   "success": true,
 *   "config": {
 *     "tranportalIdMasked": "8x1c***eI",
 *     "passwordPresent": true,
 *     "resourceKeyInfo": {
 *       "length": 64,
 *       "hexLike": true
 *     },
 *     "tranportalUrl": "https://securepayments.neoleap.com.sa/pg/payment/hosted.htm",
 *     "paymentUrl": "https://securepayments.neoleap.com.sa/pg/payment/hosted.htm",
 *     "responseUrl": "https://yourdomain.com/api/payment/response",
 *     "errorUrl": "https://yourdomain.com/api/payment/response"
 *   },
 *   "warnings": [
 *     "Callback URLs use localhost/ngrok; ARB requires whitelisted stable HTTPS domains."
 *   ],
 *   "serviceInitialized": true
 * }
 */
exports.diagnose = (req, res) => {
  try {
    let diagnosticInfo = {};
    let warnings = [];
    let serviceInitialized = false;
    
    try {
      diagnosticInfo = getDiagnosticInfo();
      serviceInitialized = true;
    } catch (configError) {
      warnings.push(`Configuration error: ${configError.message}`);
      // Try to provide partial info even with configuration errors
      const config = require('../config');
      diagnosticInfo = {
        tranportalIdMasked: config.get('ARB_TRANPORTAL_ID') ? 
          config.get('ARB_TRANPORTAL_ID').slice(0, 4) + '***' + config.get('ARB_TRANPORTAL_ID').slice(-2) : 
          '[missing]',
        passwordPresent: Boolean(config.get('ARB_TRANPORTAL_PASSWORD')),
        resourceKeyInfo: {
          length: config.get('ARB_RESOURCE_KEY') ? config.get('ARB_RESOURCE_KEY').length : 0,
          hexLike: /^[0-9a-fA-F]{64}$/.test(config.get('ARB_RESOURCE_KEY') || '')
        },
        tranportalUrl: config.get('ARB_TRANPORTAL_URL'),
        paymentUrl: config.get('ARB_PAYMENT_URL'),
        responseUrl: config.get('ARB_RESPONSE_URL'),
        errorUrl: config.get('ARB_ERROR_URL')
      };
    }
    
    // Additional validation warnings
    const { responseUrl, errorUrl } = diagnosticInfo;
    const badDomain = (url) => {
      const u = String(url || '').toLowerCase();
      return u.includes('localhost') || u.includes('127.0.0.1') || u.includes('ngrok');
    };
    
    if (badDomain(responseUrl) || badDomain(errorUrl)) {
      warnings.push('Callback URLs use localhost/ngrok; ARB requires whitelisted stable HTTPS domains.');
    }
    
    if (responseUrl && !/^https:\/\//i.test(responseUrl)) {
      warnings.push('Response URL should use HTTPS.');
    }
    
    if (errorUrl && !/^https:\/\//i.test(errorUrl)) {
      warnings.push('Error URL should use HTTPS.');
    }

    return res.json({
      success: true,
      config: diagnosticInfo,
      warnings,
      serviceInitialized
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Diagnostic check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
