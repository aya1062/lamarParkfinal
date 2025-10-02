const axios = require('axios');
const Booking = require('../models/Booking');
const { generateUrwayHash } = require('../utils/urwayHash');
const RoomBooking = require('../models/RoomBooking');
const { checkAvailability } = require('./bookingController');

// Initiate ARB payment: creates a pending booking, then requests a payment session and returns redirect URL
exports.initiatePayment = async (req, res) => {
  try {
    const {
      property,
      dates,
      guests,
      guest,
      amount,
      specialRequests
    } = req.body || {};

    // Basic validation of required fields
    if (!property || !dates?.checkIn || !dates?.checkOut || typeof dates?.nights !== 'number' || !guests || !guest?.name || !guest?.email || !guest?.phone || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields' });
    }

    // Validate property is a valid ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(property)) {
      return res.status(400).json({ success: false, message: 'Invalid property id. Provide a valid MongoDB ObjectId.' });
    }

    // Availability check before creating booking
    const availability = await checkAvailability(property, dates.checkIn, dates.checkOut);
    if (!availability.available) {
      return res.status(400).json({ success: false, message: availability.reason });
    }

    // Create pending booking
    const userId = req.user?.userId;
    const booking = new Booking({
      property,
      dates,
      guests,
      guest,
      amount,
      specialRequests,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'card',
      user: userId,
      payment: { status: 'pending', amount }
    });
    await booking.save();

    // Use bookingNumber as trackid
    const trackid = booking.bookingNumber;

    // ENV variables
    const terminalId = process.env.ARB_TRANPORTAL_ID;
    const password = process.env.ARB_TRANPORTAL_PASSWORD;
    const resourceKey = process.env.ARB_RESOURCE_KEY;
    const tokenUrlRaw = process.env.ARB_TOKEN_URL || '';
    const hostedUrlRaw = process.env.ARB_HOSTED_URL || 'https://securepayments.neoleap.com.sa/pg/payment/hosted.htm';
    const responseURLRaw = process.env.ARB_RESPONSE_URL || '';
    const errorURLRaw = process.env.ARB_ERROR_URL || '';
    const tokenUrl = tokenUrlRaw.trim();
    const hostedUrl = hostedUrlRaw.trim();
    const responseURL = responseURLRaw.trim();
    const errorURL = errorURLRaw.trim();

    if (!terminalId || !password || !resourceKey || !tokenUrl || !responseURL || !errorURL) {
      return res.status(500).json({ success: false, message: 'Payment gateway is not configured. Ensure ARB_* env vars are set.' });
    }
    const looksLikeUrl = (u) => /^https?:\/\//i.test(u);
    if (!looksLikeUrl(tokenUrl)) {
      return res.status(500).json({ success: false, message: 'Invalid ARB_TOKEN_URL. Must be a full https URL.', details: tokenUrl });
    }
    if (!looksLikeUrl(responseURL) || !looksLikeUrl(errorURL)) {
      return res.status(500).json({ success: false, message: 'Invalid ARB_RESPONSE_URL or ARB_ERROR_URL. Must be full URLs.', details: { responseURL, errorURL } });
    }

    // Build hash and payload per URWAY/ARB common format
    const currency = 'SAR';
    const action = '1';

    const requestHash = generateUrwayHash({
      terminalId,
      password,
      trackid,
      amount: amount.toFixed(2),
      currency,
      secretKey: resourceKey
    });

    // Prepare both JSON and x-www-form-urlencoded payloads (different terminals expect different media types)
    const jsonPayload = {
      terminalId,
      password,
      amount: amount.toFixed(2),
      currency,
      action,
      trackid,
      customerEmail: guest.email,
      udf1: booking._id.toString(),
      udf2: guest.phone,
      udf3: property.toString(),
      // Some gateways expect the hash in udf5 as well
      udf5: undefined,
      // Some docs use responseUrl/errorUrl (camelCase). Send both forms for compatibility.
      responseUrl: responseURL,
      errorUrl: errorURL,
      responseURL,
      errorURL,
      requestHash
    };
    const formPayload = new URLSearchParams();
    // Fill udf5 with requestHash for compatibility
    jsonPayload.udf5 = requestHash;

    Object.entries(jsonPayload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formPayload.append(k, String(v));
    });

    // Request payment session/token
    let pgRes;
    try {
      // Try JSON first
      pgRes = await axios.post(tokenUrl, jsonPayload, { headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Accept': 'text/html,application/json,text/plain,*/*' } });
    } catch (e1) {
      const status = e1?.response?.status;
      const body = e1?.response?.data;
      const is415 = status === 415 || (typeof body === 'string' && body.includes('Unsupported Media Type'));
      if (!is415) {
        // Rollback booking on gateway failure (non-media-type error)
        await Booking.findByIdAndDelete(booking._id);
        return res.status(502).json({ success: false, message: 'Failed to contact payment gateway', details: body || e1.message });
      }
      // Retry as x-www-form-urlencoded
      try {
        pgRes = await axios.post(tokenUrl, formPayload.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'text/html,application/json,text/plain,*/*' } });
      } catch (e2) {
        await Booking.findByIdAndDelete(booking._id);
        return res.status(502).json({ success: false, message: 'Failed to contact payment gateway', details: e2?.response?.data || e2.message });
      }
    }

    // Parse response: ARB may return JSON, querystring, or HTML
    let data = pgRes.data;
    let targetUrl, paymentId, messageFromGateway;
    try {
      if (typeof data === 'string') {
        const str = data;
        // Try querystring style: key=value&key2=value2
        if (str.includes('paymentid=') || str.includes('paymentId=') || str.includes('payid=') || str.includes('targetUrl=')) {
          const qs = new URLSearchParams(str.replace(/\n/g, '&').replace(/\r/g, ''));
          paymentId = qs.get('paymentid') || qs.get('paymentId') || qs.get('payid') || qs.get('PaymentId') || qs.get('PAYID');
          targetUrl = qs.get('targetUrl') || qs.get('redirectUrl') || qs.get('paymentURL');
          messageFromGateway = qs.get('message') || qs.get('Message');
        }
        // Try HTML: find form action and paymentid
        if (!targetUrl) {
          const actionMatch = str.match(/action=["']([^"']+)["']/i);
          if (actionMatch) targetUrl = actionMatch[1];
        }
        if (!paymentId) {
          const pidMatch = str.match(/paymentid\s*[=:]\s*([A-Za-z0-9_-]+)/i) || str.match(/payid\s*[=:]\s*([A-Za-z0-9_-]+)/i);
          if (pidMatch) paymentId = pidMatch[1];
        }
      } else if (typeof data === 'object' && data) {
        targetUrl = data.targetUrl || data.redirectUrl || data.paymentURL || data.url || data.TargetUrl || data.PAYMENT_URL;
        paymentId = data.paymentId || data.paymentid || data.payid || data.PaymentId || data.PAYID;
        messageFromGateway = data.message || data.Message;
      }
    } catch (_) {
      // fallthrough
    }

    // Fallback: if paymentId exists but targetUrl missing, build using hosted URL
    if (!targetUrl && paymentId) {
      targetUrl = hostedUrl;
    }

    if (!targetUrl || !paymentId) {
      const debug = process.env.NODE_ENV === 'production' ? undefined : data;
      return res.status(502).json({ success: false, message: 'Invalid response from payment gateway', details: debug });
    }

    // Persist transactionId/paymentId for later reconciliation
    booking.payment.transactionId = paymentId;
    await booking.save();

    const redirectUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}paymentid=${encodeURIComponent(paymentId)}`;

    // In non-production, optionally log raw gateway response for debugging
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[ARB initiate] status:', pgRes.status);
        console.log('[ARB initiate] headers:', pgRes.headers);
        console.log('[ARB initiate] parsed:', { targetUrl, paymentId });
      } catch (_) {}
    }

    return res.status(200).json({ success: true, redirectUrl, bookingNumber: trackid, targetUrl, paymentId });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Success callback from ARB/URWAY. Updates booking and redirects user to frontend success page.
exports.handleSuccessCallback = async (req, res) => {
  try {
    // ARB typically returns query/body with result, trackid, paymentid, authcode, etc.
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const trackid = params.trackid || params.TrackId || params.trackId;
    const result = String(params.result || params.Result || '').toLowerCase();
    const paymentId = params.paymentid || params.PaymentId || params.paymentID;

    if (!trackid) {
      return res.status(400).send('Missing trackid');
    }

    // Find booking either in property bookings or room bookings
    let kind = 'property';
    let booking = await Booking.findOne({ bookingNumber: trackid });
    if (!booking) {
      kind = 'room';
      booking = await RoomBooking.findOne({ bookingNumber: trackid });
    }
    if (!booking) {
      return res.status(404).send('Booking not found');
    }

    // Idempotency: if already paid with same transactionId, just redirect
    if (booking.payment?.status === 'paid' && booking.payment?.transactionId === paymentId) {
      const frontendAlready = process.env.FRONTEND_URL || 'https://lamarparks.com';
      const redirectAlready = `${frontendAlready}/booking/success?trackid=${encodeURIComponent(trackid)}&result=successful`;
      return res.redirect(302, redirectAlready);
    }

    // Optional authenticity verification if response hash fields provided by ARB
    const respAmount = parseFloat(params.amount || params.AMOUNT || params.amt || params.Amount || '0');
    const respCurrency = (params.currency || params.CURRENCY || 'SAR').toString().toUpperCase();
    const terminalId = process.env.ARB_TRANPORTAL_ID;
    const password = process.env.ARB_TRANPORTAL_PASSWORD;
    const resourceKey = process.env.ARB_RESOURCE_KEY;
    // Common response hash pattern varies by integration; attempt a verification if responseHash present
    const responseHash = params.responseHash || params.udf5 || params.Hash || params.hash;
    if (responseHash && terminalId && password && resourceKey) {
      try {
        // Try same pattern as request for lack of a better spec. Adjust if ARB doc differs.
        const verifyHash = generateUrwayHash({
          terminalId,
          password,
          trackid,
          amount: respAmount ? respAmount.toFixed(2) : (booking.amount || booking.pricing?.totalAmount || 0).toFixed(2),
          currency: respCurrency || 'SAR',
          secretKey: resourceKey
        });
        if (typeof responseHash === 'string' && responseHash.toLowerCase() !== verifyHash.toLowerCase()) {
          return res.status(400).send('Hash verification failed');
        }
      } catch (_) {
        // If verification fails due to format, proceed but consider logging
      }
    }

    // Amount & currency consistency checks
    const expectedAmount = kind === 'property' ? (booking.amount || 0) : (booking.pricing?.totalAmount || 0);
    if (respAmount && Math.abs(respAmount - expectedAmount) > 0.009) {
      return res.status(400).send('Amount mismatch');
    }
    if (respCurrency && respCurrency !== 'SAR') {
      return res.status(400).send('Currency mismatch');
    }

    // Mark payment success and persist metadata
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.payment = booking.payment || {};
    booking.payment.status = 'paid';
    booking.payment.paymentDate = new Date();
    if (paymentId) booking.payment.transactionId = paymentId;
    booking.payment.gatewayResponse = {
      result: params.result || params.Result,
      authCode: params.authcode || params.AuthCode,
      ref: params.ref || params.Ref,
      tranid: params.tranid || params.TranId,
      paymentid: paymentId,
      cardBrand: params.cardBrand || params.CardBrand,
      raw: params
    };
    await booking.save();

    // Redirect to frontend success page with status and trackid
    const frontend = process.env.FRONTEND_URL || 'https://lamarparks.com';
    const redirect = `${frontend}/booking/success?trackid=${encodeURIComponent(trackid)}&result=successful`;
    return res.redirect(302, redirect);
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
};

// Error/cancel callback from ARB. Marks booking as failed (keeps pending booking) then redirects.
exports.handleErrorCallback = async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const trackid = params.trackid || params.TrackId || params.trackId;
    const paymentId = params.paymentid || params.PaymentId || params.paymentID;

    if (trackid) {
      let booking = await Booking.findOne({ bookingNumber: trackid });
      let kind = 'property';
      if (!booking) {
        kind = 'room';
        booking = await RoomBooking.findOne({ bookingNumber: trackid });
      }
      if (booking) {
        booking.payment = booking.payment || {};
        booking.payment.status = 'failed';
        if (paymentId) booking.payment.transactionId = paymentId;
        booking.payment.gatewayResponse = { ...(booking.payment.gatewayResponse || {}), raw: params };
        // Business rule: cancel booking on failed payment
        booking.status = 'cancelled';
        await booking.save();
      }
    }

    const frontend = process.env.FRONTEND_URL || 'https://lamarparks.com';
    const redirect = `${frontend}/booking/success?trackid=${encodeURIComponent(trackid || '')}&result=failed`;
    return res.redirect(302, redirect);
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
};


