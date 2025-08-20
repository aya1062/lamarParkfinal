const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Property = require('../models/Property');

// Initialize Stripe (if configured)
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } else {
    console.log('Stripe not configured - checkout functionality will be disabled');
  }
} catch (error) {
  console.log('Stripe initialization failed:', error.message);
}

// إنشاء جلسة دفع Stripe
exports.createCheckoutSession = async (req, res) => {
  try {
    const { 
      propertyId, 
      checkIn, 
      checkOut, 
      guests, 
      guestInfo,
      totalPrice,
      nights 
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!propertyId || !checkIn || !checkOut || !guests || !guestInfo || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'جميع البيانات مطلوبة'
      });
    }

    // التحقق من توفر العقار
    const Property = require('../models/Property');
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'العقار غير موجود'
      });
    }

    // التحقق من التوفر في التواريخ المحددة
    const bookingController = require('./bookingController');
    const availability = await bookingController.checkAvailability(propertyId, checkIn, checkOut);
    
    if (!availability.available) {
      return res.status(400).json({
        success: false,
        message: availability.reason || 'العقار غير متاح في التواريخ المحددة'
      });
    }

    // إنشاء جلسة Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'sar',
            product_data: {
              name: property.name,
              description: `حجز ${nights} ليلة من ${checkIn} إلى ${checkOut}`,
              images: property.images ? [property.images[0]] : [],
            },
            unit_amount: Math.round(totalPrice * 100), // Stripe يتطلب المبلغ بالهللات
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/property/${propertyId}`,
      metadata: {
        propertyId,
        checkIn,
        checkOut,
        guests: guests.toString(),
        guestName: guestInfo.name,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        nights: nights.toString(),
        totalPrice: totalPrice.toString()
      },
      customer_email: guestInfo.email,
    });

    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء جلسة الدفع'
    });
  }
};

// Webhook لتأكيد الدفع
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // التعامل مع الأحداث
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// معالجة اكتمال جلسة الدفع
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('Processing completed checkout session:', session.id);

    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      guestName,
      guestEmail,
      guestPhone,
      nights,
      totalPrice
    } = session.metadata;

    // إنشاء الحجز
    const booking = new Booking({
      guest: {
        name: guestName,
        email: guestEmail,
        phone: guestPhone
      },
      property: propertyId,
      dates: {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        nights: parseInt(nights)
      },
      guests: parseInt(guests),
      amount: parseFloat(totalPrice),
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      bookingDate: new Date()
    });

    await booking.save();

    // إنشاء سجل الدفع
    const payment = new Payment({
      booking: booking._id,
      user: null, // يمكن إضافة المستخدم إذا كان مسجل دخول
      amount: parseFloat(totalPrice),
      status: 'paid',
      paymentDate: new Date(),
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent
    });

    await payment.save();

    console.log('Booking and payment created successfully:', booking._id);

    // هنا يمكن إرسال إيميل تأكيد للحجز
    // await sendBookingConfirmationEmail(guestEmail, booking);

  } catch (error) {
    console.error('Error processing checkout session:', error);
  }
}

// معالجة نجاح الدفع
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  // يمكن إضافة منطق إضافي هنا
}

// معالجة فشل الدفع
async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  // يمكن إضافة منطق إضافي هنا
}

// جلب تفاصيل جلسة الدفع
exports.getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'جلسة الدفع غير موجودة'
      });
    }

    res.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تفاصيل الجلسة'
    });
  }
}; 