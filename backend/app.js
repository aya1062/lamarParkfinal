const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
// const checkoutRoutes = require('./routes/checkoutRoutes');
const contactRoutes = require('./routes/contactRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const roomBookingRoutes = require('./routes/roomBookingRoutes');
const exportRoutes = require('./routes/exportRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const path = require("path");

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://lamarpark.up.railway.app',
  'https://your-frontend-domain.com',
  'https://lamar-park.vercel.app',
  'https://lamarparks.com',   // ← ضيفي ده
  'http://lamarparks.com',
  'https://www.lamarparks.com',   // ← ضيفي ده
  'http://www.lamarparks.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    const isLocalNetwork = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)\d+\.\d+:(3000|5173)$/.test(origin);
    if (process.env.NODE_ENV !== 'production' && isLocalNetwork) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests for all routes
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for images
app.use('/lamar', express.static(path.join(__dirname, 'client/public/lamar')));
app.use('/imageProperety', express.static(path.join(__dirname, 'client/public/imageProperety')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/pricing', pricingRoutes);
// app.use('/api/checkout', checkoutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-bookings', roomBookingRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/partners', partnerRoutes);

// Test routes
// Payment test pages removed

app.get('/test-direct-payment', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-direct-payment.html'));
});

// Legacy payment routes removed. Integrate new gateway separately.

// Root API check
app.get('/', (req, res) => {
  res.send('Lamar API is running');
});

module.exports = app;
