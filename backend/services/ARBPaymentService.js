/**
 * ARB Payment Gateway Service
 * 
 * Simple function-based service for Al Rajhi Bank (ARB/Neoleap) payment gateway integration.
 * Provides straightforward functions for payment operations without complex class structures.
 * 
 * Features:
 * - Configuration validation
 * - Secure transaction data encryption (AES-256-CBC)
 * - Payment token generation with ARB API
 * - Response parsing and error handling
 * - Diagnostic information for troubleshooting
 * 
 * @module ARBPaymentService
 * @requires axios
 * @requires ../utils/arbPayment
 * @requires ../config
 */

const axios = require('axios');
const { encryptAES, buildTransactionData } = require('../utils/arbPayment');
const config = require('../config');

/**
 * Validate ARB configuration
 * 
 * @private
 * @throws {Error} If required configuration is missing
 */
function validateARBConfig() {
  if (!config.isARBConfigured()) {
    const arbConfig = config.getARBConfig();
    const missing = ['tranportalId', 'password', 'resourceKey', 'tranportalUrl']
      .filter(field => !arbConfig[field]);
    throw new Error(`Missing required ARB configuration: ${missing.join(', ')}`);
  }

  const resourceKey = config.get('ARB_RESOURCE_KEY');
  if (resourceKey && resourceKey.length !== 32 && !/^[0-9a-fA-F]{64}$/.test(resourceKey)) {
    console.warn(`⚠️ ARB_RESOURCE_KEY length is ${resourceKey.length}, expected 32 bytes or 64 hex chars`);
  }
}

/**
 * Get ARB callback URLs
 * 
 * @returns {{ responseUrl: string, errorUrl: string }} Callback URLs
 */
function getCallbackUrls() {
  return {
    responseUrl: config.get('ARB_RESPONSE_URL'),
    errorUrl: config.get('ARB_ERROR_URL')
  };
}

/**
 * Build and encrypt transaction data for ARB API
 * 
 * @param {Object} paymentData - Payment information object
 * @param {string|number} paymentData.amount - Payment amount in SAR
 * @param {string} paymentData.trackId - Unique tracking identifier
 * @param {string} [paymentData.bookingId] - Optional booking reference
 * @returns {{ encryptedData: string, plaintext: string }} Encrypted transaction data
 * @throws {Error} If encryption produces invalid format
 */
function buildEncryptedTransaction(paymentData) {
  const { amount, trackId, bookingId } = paymentData;
  const { responseUrl, errorUrl } = getCallbackUrls();
  const arbConfig = config.getARBConfig();

  const trandataString = buildTransactionData({
    tranportalId: arbConfig.tranportalId,
    password: arbConfig.password,
    amount: parseFloat(amount).toFixed(2),
    trackId,
    responseUrl,
    errorUrl,
    udf1: bookingId || '',
    udf2: '',
    udf3: '',
    udf4: '',
    udf5: ''
  });

  const encryptedData = encryptAES(trandataString, arbConfig.resourceKey)
    .replace(/[^0-9A-Fa-f]/g, '')
    .toUpperCase();

  if (!/^[0-9A-F]+$/.test(encryptedData)) {
    throw new Error('Invalid encrypted trandata format - not pure HEX');
  }

  return { encryptedData, plaintext: trandataString };
}

/**
 * Generate payment token from ARB gateway
 * 
 * @async
 * @param {Object} paymentData - Payment information object
 * @param {string|number} paymentData.amount - Payment amount in SAR (must be positive)
 * @param {string} paymentData.trackId - Unique tracking identifier for transaction
 * @param {string} [paymentData.bookingId] - Optional booking reference for UDF1
 * @returns {Promise<{ paymentId: string, redirectUrl: string }>} Payment token result
 * @throws {Error} If payment token generation fails or ARB returns error
 */
async function generatePaymentToken(paymentData) {
  validateARBConfig();
  
  const { encryptedData } = buildEncryptedTransaction(paymentData);
  const { responseUrl, errorUrl } = getCallbackUrls();
  const arbConfig = config.getARBConfig();

  const payload = {
    id: arbConfig.tranportalId,
    trandata: encryptedData,
    responseURL: responseUrl,
    errorURL: errorUrl
  };

  try {
    const arbRes = await axios.post(arbConfig.tranportalUrl, [payload], {
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      timeout: 20000,
      validateStatus: null
    });

    if (arbRes.status !== 200) {
      throw new Error(`ARB API returned status ${arbRes.status}`);
    }

    return parseARBTokenResponse(arbRes.data);
  } catch (error) {
    if (error.response) {
      throw new Error(`ARB API Error: ${error.response.status} - ${JSON.stringify(error.response.data).slice(0, 200)}`);
    }
    throw new Error(`ARB Request Failed: ${error.message}`);
  }
}

/**
 * Parse ARB payment token generation response
 * 
 * @private
 * @param {*} responseData - Raw response data from ARB API
 * @returns {{ paymentId: string, redirectUrl: string }} Parsed payment information
 * @throws {Error} If response cannot be parsed or contains errors
 */
function parseARBTokenResponse(responseData) {
  let body = responseData;
  let obj = null;

  // Handle different response formats
  if (Array.isArray(body) && body.length > 0 && typeof body[0] === 'object') {
    obj = body[0];
  } else if (typeof body === 'object') {
    obj = body;
  }

  // Check for error responses
  if (obj && obj.error && obj.errorText) {
    throw new Error(`ARB Error: ${obj.error} - ${obj.errorText}`);
  }

  let paymentId = null;
  let hostedUrl = null;

  // Extract PaymentID and URL from result
  const resultStr = obj && obj.result ? String(obj.result) : null;
  if (resultStr) {
    const parts = resultStr.split(':');
    if (parts.length >= 2 && parts[0].match(/^[A-Za-z0-9\-_]+$/)) {
      paymentId = parts[0];
      hostedUrl = parts.slice(1).join(':');
    } else {
      const match = resultStr.match(/PaymentID=([A-Za-z0-9\-_%]+)/);
      if (match) paymentId = match[1];
      const urlMatch = resultStr.match(/https?:\/\/[^"'\s]+/);
      if (urlMatch) hostedUrl = urlMatch[0];
    }
  }

  // Try string body if object parsing failed
  if (!paymentId && typeof body === 'string') {
    const match = body.match(/PaymentID=([A-Za-z0-9\-_%]+)/);
    if (match) paymentId = match[1];
    const urlMatch = body.match(/https?:\/\/[^"'\s]+/);
    if (urlMatch) hostedUrl = urlMatch[0];
  }

  if (!paymentId) {
    throw new Error('No PaymentID found in ARB response');
  }

  // Construct hosted URL if missing
  const paymentUrl = config.get('ARB_PAYMENT_URL');
  if (!hostedUrl && paymentUrl) {
    hostedUrl = paymentUrl;
  }

  // Ensure PaymentID is appended to URL
  if (hostedUrl && !hostedUrl.includes('PaymentID=')) {
    const separator = hostedUrl.includes('?') ? '&' : '?';
    hostedUrl = `${hostedUrl}${separator}PaymentID=${paymentId}`;
  }

  if (!hostedUrl) {
    throw new Error('Unable to construct hosted payment URL');
  }

  return { paymentId, redirectUrl: hostedUrl };
}

/**
 * Get redacted configuration information for diagnostics
 * 
 * @returns {Object} Sanitized configuration object for diagnostics
 */
function getDiagnosticInfo() {
  const arbConfig = config.getARBConfig();
  
  return {
    tranportalIdMasked: arbConfig.tranportalId ? 
      arbConfig.tranportalId.slice(0, 4) + '***' + arbConfig.tranportalId.slice(-2) : 
      '[missing]',
    passwordPresent: Boolean(arbConfig.password),
    resourceKeyInfo: {
      length: arbConfig.resourceKey ? arbConfig.resourceKey.length : 0,
      hexLike: /^[0-9a-fA-F]{64}$/.test(arbConfig.resourceKey || '')
    },
    tranportalUrl: arbConfig.tranportalUrl,
    paymentUrl: arbConfig.paymentUrl,
    ...getCallbackUrls()
  };
}

module.exports = {
  generatePaymentToken,
  getDiagnosticInfo,
  getCallbackUrls,
  buildEncryptedTransaction
};