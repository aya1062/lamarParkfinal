const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const roomBookingRoutes = require('./routes/roomBookingRoutes');
const exportRoutes = require('./routes/exportRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const quickLinkRoutes = require('./routes/quickLinks');
const path = require("path");

const app = express();

/**
 * Allowed Origins
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://lamarpark.up.railway.app',
  'https://lamar-park.vercel.app',
  'https://lamarparks.com',
  'http://lamarparks.com',
  'https://www.lamarparks.com',
  'http://www.lamarparks.com',
  'https://api.lamarparks.com',
  'http://api.lamarparks.com',
  process.env.FRONTEND_URL
].filter(Boolean);

/**
 * CORS Config (MAIN FIX)
 */
const corsOptions = {
  origin: function (origin, callback) {
    // allow server-to-server or mobile apps (no origin)
    if (!origin) return callback(null, true);

    const lamarPattern = /^https?:\/\/(www\.)?lamarparks\.com$/;

    if (allowedOrigins.includes(origin) || lamarPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

/**
 * Apply CORS globally
 */
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/**
 * Special CORS override for payment (callbacks)
 */
app.use('/api/payment', cors({
  origin: true,
  credentials: false
}));

/**
 * Body Parser
 */
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

/**
 * Static files
 */
app.use('/lamar', express.static(path.join(__dirname, 'client/public/lamar')));
app.use('/imageProperety', express.static(path.join(__dirname, 'client/public/imageProperety')));

/**
 * Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-bookings', roomBookingRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/quick-links', quickLinkRoutes);

/**
 * Root
 */
app.get('/', (req, res) => {
  res.send('Lamar API is running');
});

module.exports = app;