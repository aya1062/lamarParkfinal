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
  'https://lamarparks.com',
  'http://lamarparks.com',
  'https://www.lamarparks.com',
  'http://www.lamarparks.com',
  'https://api.lamarparks.com',
  'http://api.lamarparks.com',
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS configuration for payment routes (ARB callbacks may not have origin)
app.use('/api/payment', cors({
  origin: true, // Allow all origins for payment callbacks
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Content-Length']
}));

// CORS configuration object for reuse
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without origin (like ARB callbacks, mobile apps, etc.)
    if (!origin) {
      console.log('CORS: No origin header, allowing request');
      return callback(null, true);
    }
    console.log('CORS: Checking origin:', origin);
    
    // Check exact match first
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Origin allowed (exact match):', origin);
      return callback(null, true);
    }
    
    // Check if origin matches lamarparks.com domain (with or without www, http/https)
    const lamarparksPattern = /^https?:\/\/(www\.)?lamarparks\.com$/i;
    if (lamarparksPattern.test(origin)) {
      console.log('CORS: Origin allowed (lamarparks.com pattern):', origin);
      return callback(null, true);
    }
    
    // Check local network for development
    const isLocalNetwork = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)\d+\.\d+:(3000|5173)$/.test(origin);
    if (process.env.NODE_ENV !== 'production' && isLocalNetwork) {
      console.log('CORS: Local network origin allowed:', origin);
      return callback(null, true);
    }
    
    console.log('CORS: Origin blocked:', origin);
    console.log('CORS: Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Content-Length',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS before any routes
app.use(cors(corsOptions));

// Handle preflight requests for all routes with same CORS options
app.options('*', cors(corsOptions));

// Manual CORS headers as fallback (in case middleware fails)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('Request origin:', origin);
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  
  if (origin) {
    const lamarparksPattern = /^https?:\/\/(www\.)?lamarparks\.com$/i;
    if (allowedOrigins.includes(origin) || lamarparksPattern.test(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Content-Length, Cache-Control, X-File-Name');
      res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }
    }
  }
  next();
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

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
