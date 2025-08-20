const crypto = require('crypto');
const axios = require('axios');

// URWAY Configuration
const URWAY_TEST_CONFIG = require('../config/urway-test');

const URWAY_CONFIG = {
  test: {
    baseUrl: URWAY_TEST_CONFIG.test.baseUrl,
    terminalId: process.env.URWAY_TERMINAL_ID_TEST || URWAY_TEST_CONFIG.test.terminalId,
    password: process.env.URWAY_PASSWORD_TEST || URWAY_TEST_CONFIG.test.password,
    secretKey: process.env.URWAY_SECRET_KEY_TEST || URWAY_TEST_CONFIG.test.secretKey
  },
  production: {
    baseUrl: URWAY_TEST_CONFIG.production.baseUrl,
    terminalId: process.env.URWAY_TERMINAL_ID_PROD || URWAY_TEST_CONFIG.production.terminalId,
    password: process.env.URWAY_PASSWORD_PROD || URWAY_TEST_CONFIG.production.password,
    secretKey: process.env.URWAY_SECRET_KEY_PROD || URWAY_TEST_CONFIG.production.secretKey
  }
};

// Generate SHA256 Hash for URWAY
const generateRequestHash = (trackId, terminalId, password, secretKey, amount, currency) => {
  const hashSequence = `${trackId}|${terminalId}|${password}|${secretKey}|${amount}|${currency}`;
  return crypto.createHash('sha256').update(hashSequence).digest('hex');
};

// Generate Response Hash for verification
const generateResponseHash = (tranId, secretKey, responseCode, amount) => {
  const hashSequence = `${tranId}|${secretKey}|${responseCode}|${amount}`;
  return crypto.createHash('sha256').update(hashSequence).digest('hex');
};

// Create Payment Transaction
const createPayment = async (req, res) => {
  try {
    const { amount, trackId, customerEmail, customerName, customerMobile, country = 'SA', currency = 'SAR' } = req.body;
    
    const config = process.env.NODE_ENV === 'production' ? URWAY_CONFIG.production : URWAY_CONFIG.test;
    
    // Generate request hash
    const requestHash = generateRequestHash(
      trackId,
      config.terminalId,
      config.password,
      config.secretKey,
      amount,
      currency
    );

    // Prepare payment request
    const paymentRequest = {
      trackid: trackId,
      terminalId: config.terminalId,
      action: "1", // Purchase
      customerEmail: customerEmail,
      customerName: customerName || 'Customer',
      customerMobile: customerMobile || '',
      merchantIp: req.ip || req.connection.remoteAddress,
      password: config.password,
      currency: currency,
      amount: amount.toString(),
      country: country,
      requestHash: requestHash
    };

    // Send request to URWAY
    const response = await axios.post(
      `${config.baseUrl}/transaction/jsonProcess/JSONrequest`,
      paymentRequest,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.targetUrl && response.data.payid) {
      // Redirect to URWAY payment page
      const paymentUrl = `${response.data.targetUrl}?paymentid=${response.data.payid}`;
      
      res.json({
        success: true,
        paymentUrl: paymentUrl,
        payId: response.data.payid,
        message: 'Payment initiated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to initiate payment',
        error: response.data
      });
    }

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Handle Payment Response
const handlePaymentResponse = async (req, res) => {
  try {
    const {
      PaymentId,
      TranId,
      Result,
      ResponseCode,
      TrackId,
      amount,
      responseHash,
      cardBrand,
      maskedPAN,
      metaData
    } = req.query;

    const config = process.env.NODE_ENV === 'production' ? URWAY_CONFIG.production : URWAY_CONFIG.test;

    // Verify response hash
    const calculatedHash = generateResponseHash(TranId, config.secretKey, ResponseCode, amount);
    
    if (calculatedHash !== responseHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid response hash - transaction may be tampered'
      });
    }

    // Process payment result
    if (Result === 'Successful' && ResponseCode === '000') {
      // Payment successful - update booking status
      try {
        const Booking = require('../models/Booking');
        const booking = await Booking.findOne({ bookingNumber: TrackId });
        if (booking) {
          booking.status = 'confirmed';
          await booking.save();
        }
      } catch (err) {
        console.error('Error updating booking status:', err);
      }
      
      res.json({
        success: true,
        message: 'Payment successful',
        transactionId: TranId,
        amount: amount,
        cardBrand: cardBrand,
        maskedPAN: maskedPAN
      });
    } else {
      // Payment failed
      res.json({
        success: false,
        message: 'Payment failed',
        responseCode: ResponseCode,
        result: Result
      });
    }

  } catch (error) {
    console.error('Payment response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment response',
      error: error.message
    });
  }
};

// Transaction Inquiry
const inquireTransaction = async (req, res) => {
  try {
    const { transId, trackId, amount, currency = 'SAR' } = req.body;
    
    const config = process.env.NODE_ENV === 'production' ? URWAY_CONFIG.production : URWAY_CONFIG.test;
    
    // Generate request hash for inquiry
    const requestHash = generateRequestHash(
      trackId,
      config.terminalId,
      config.password,
      config.secretKey,
      amount,
      currency
    );

    const inquiryRequest = {
      transid: transId,
      trackid: trackId,
      terminalId: config.terminalId,
      action: "10", // Transaction inquiry
      merchantIp: req.ip || req.connection.remoteAddress,
      password: config.password,
      currency: currency,
      amount: amount.toString(),
      requestHash: requestHash
    };

    const response = await axios.post(
      `${config.baseUrl}/transaction/jsonProcess/JSONrequest`,
      inquiryRequest,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      transaction: response.data
    });

  } catch (error) {
    console.error('Transaction inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error inquiring transaction',
      error: error.message
    });
  }
};

module.exports = {
  createPayment,
  handlePaymentResponse,
  inquireTransaction
};
