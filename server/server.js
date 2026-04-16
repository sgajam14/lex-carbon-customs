const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
mongoose.set('bufferCommands', false);

// Security middleware
app.use(helmet());
app.use(morgan('dev'));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use('/api/', limiter);

// CORS
const normalizeOrigin = (value = '') => value.trim().replace(/\/+$/, '');

const allowedClientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean)
  .map((origin) => {
    if (!origin.includes('*')) return origin;
    const escaped = origin.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
  });

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser and same-origin requests without an Origin header.
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    const allowed = allowedClientOrigins.some((allowedOrigin) => (
      allowedOrigin instanceof RegExp
        ? allowedOrigin.test(normalizedOrigin)
        : allowedOrigin === normalizedOrigin
    ));

    return callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
  },
  credentials: true,
}));

// Body parser — Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bundles', require('./routes/bundles'));

// Health check
app.get('/api/health', (req, res) => {
  const dbStateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStateMap[mongoose.connection.readyState] || 'unknown';

  res.json({
    status: dbState === 'connected' ? 'ok' : 'degraded',
    dbState,
    timestamp: new Date(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status < 500 ? err.message : 'Something went wrong. Please try again.',
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lex-carbon-customs';

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
