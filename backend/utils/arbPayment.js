const crypto = require('crypto');
const qs = require('qs');

/**
 * Al Rajhi Bank Payment Gateway Utility Module
 * Implements AES-256-CBC encryption/decryption per ARB REST API v1.24
 */

// ARB-specific constants
const IV = 'PGKEYENCDECIVSPC'; // Fixed IV as per ARB specification
const ALGORITHM = 'aes-256-cbc';

// Build a 32-byte key buffer from resourceKey supporting hex or utf8 forms
function getKeyBuffer(resourceKey) {
  // If resourceKey looks like 64 hex chars, treat as hex; else utf8
  const isHex = typeof resourceKey === 'string' && /^[0-9a-fA-F]{64}$/.test(resourceKey);
  const src = isHex ? Buffer.from(resourceKey, 'hex') : Buffer.from(String(resourceKey || ''), 'utf8');
  if (src.length === 32) return src;
  const key = Buffer.alloc(32);
  src.copy(key, 0, 0, Math.min(32, src.length));
  return key;
}

/**
 * Encrypt transaction data using AES-256-CBC
 * @param {string} plainText - The plain text transaction data (must be URL-encoded first per ARB spec)
 * @param {string} resourceKey - ARB Resource Key (32 bytes or 64 hex chars)
 * @returns {string} HEX encoded encrypted string (uppercase)
 */
function encryptAES(plainText, resourceKey) {
  try {
    const key = getKeyBuffer(resourceKey);
    const iv = Buffer.from(IV, 'utf8');
    
    // ARB requires URL-encoding the plaintext BEFORE encryption
    const urlEncodedPlainText = encodeURIComponent(plainText);
    
    // Create cipher with PKCS7 padding (Node.js default, equivalent to PKCS5)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(urlEncodedPlainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // ARB expects uppercase HEX
    return encrypted.toUpperCase();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt transaction data');
  }
}

/**
 * Decrypt ARB response data using AES-256-CBC
 * @param {string} hexText - HEX encoded encrypted string
 * @param {string} resourceKey - ARB Resource Key (32 bytes or 64 hex chars)
 * @returns {string} Decrypted and URL-decoded plain text
 */
function decryptAES(hexText, resourceKey) {
  try {
    const key = getKeyBuffer(resourceKey);
    const iv = Buffer.from(IV, 'utf8');
    
    // Create decipher with PKCS7 padding (Node.js default, equivalent to PKCS5)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(hexText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // ARB requires URL-decoding after decryption
    return decodeURIComponent(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt ARB response');
  }
}

/**
 * Build transaction data string for ARB payment initiation
 * Canonical per docs: JSON array containing a single object with required fields.
 * @param {Object} params - Transaction parameters
 * @returns {string} query-string transaction data (will be URL-encoded then encrypted)
 */
function buildTransactionData(params) {
  const {
    tranportalId,
    password,
    action = '1', // 1 = Purchase
  langid = '', // Language ID (use 'AR'/'ar' for Arabic, 'USA' for English per some examples)
    currency = '682', // SAR currency code
    amount,
    trackId,
    responseUrl,
    errorUrl,
    udf1 = '', // Custom fields
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = ''
  } = params;

  // Build transaction data as key=value pairs. Field names must match ARB's exact case.
  // Normalize langid: ARB docs require 'ar' or 'AR' for Arabic. For English some examples use 'USA'.
  // If caller passed 'en' we map it to 'USA'. If empty, we omit langid to let gateway default to English.
  let normalizedLangid;
  if (langid && String(langid).toLowerCase() === 'en') {
    normalizedLangid = 'USA';
  } else if (langid) {
    normalizedLangid = String(langid);
  } else {
    normalizedLangid = null;
  }

  const trandataObj = {
    id: tranportalId,
    password: password,
    action: action,
    // Only include langid when explicitly provided or mapped
    ...(normalizedLangid ? { langid: normalizedLangid } : {}),
    currencyCode: currency,
    amt: amount,
    trackId: trackId,
    responseURL: responseUrl,
    errorURL: errorUrl,
    udf1: udf1,
    udf2: udf2,
    udf3: udf3,
    udf4: udf4,
    udf5: udf5
  };

  // Warn if using ephemeral/local callback URLs; many gateways require whitelisted static URLs
  try {
    const lowerResp = String(responseUrl || '').toLowerCase();
    const lowerErr = String(errorUrl || '').toLowerCase();
    if (lowerResp.includes('ngrok') || lowerResp.includes('localhost') || lowerResp.includes('127.0.0.1') ||
        lowerErr.includes('ngrok') || lowerErr.includes('localhost') || lowerErr.includes('127.0.0.1')) {
      console.warn('⚠️  WARNING: ARB callback URLs appear to be local or use ngrok. Gateways often require whitelisted static callback URLs. Use a production/test static URL and register it in the merchant portal.');
    }
  } catch (e) {
    // ignore
  }

  // The official ARB docs show examples using a JSON array containing a single object
  // (e.g. [{"amt":"12.00","action":"1", ...}]). Return that canonical JSON string.
  // We still URL-encode the JSON before encryption in encryptAES per the spec.
  return JSON.stringify([trandataObj]);
}

/**
 * Parse decrypted ARB response string
 * @param {string} decryptedData - Pipe-delimited response string
 * @returns {Object} Parsed response object
 */
function parseARBResponse(decryptedData) {
  try {
    // ARB responses may be either JSON (e.g. callbacks) or pipe-delimited key=value strings.
    const trimmed = (decryptedData || '').trim();
    if (!trimmed) return {};

    // If it starts with '[' or '{' parse as JSON
    if (trimmed[0] === '{' || trimmed[0] === '[') {
      try {
        const parsed = JSON.parse(trimmed);
        // If the response is an array with a single object, return that object
        if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === 'object') {
          return parsed[0];
        }
        return parsed;
      } catch (err) {
        // fallthrough to pipe parse below if JSON parse fails
      }
    }

    const pairs = trimmed.split('|');
    const response = {};
    pairs.forEach(pair => {
      const [key, ...rest] = pair.split('=');
      if (key) {
        response[key.trim()] = rest.join('=').trim();
      }
    });
    return response;
  } catch (error) {
    console.error('Parse error:', error);
    throw new Error('Failed to parse ARB response');
  }
}

/**
 * Validate ARB payment response
 * @param {Object} response - Parsed ARB response
 * @returns {boolean} True if payment was successful
 */
function isPaymentSuccessful(response) {
  // According to ARB spec, result should be "CAPTURED" for successful payments
  return response.result === 'CAPTURED' && 
         (response.authRespCode === '00' || response.authRespCode === '000');
}

module.exports = {
  encryptAES,
  decryptAES,
  buildTransactionData,
  parseARBResponse,
  isPaymentSuccessful,
  // export for testing
  _getKeyBuffer: getKeyBuffer
};
