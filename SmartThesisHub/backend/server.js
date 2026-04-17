const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// ─── SOCKET.IO ────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Make io available in routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ─── MIDDLEWARE ───────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── DATABASE ─────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_thesis_hub')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

// ─── ROUTES ───────────────────────────────────────
app.use('/api/auth',         authLimiter, require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/supervisors',  require('./routes/supervisors'));
app.use('/api/students',     require('./routes/students'));
app.use('/api/projects',     require('./routes/projects'));
app.use('/api/requests',     require('./routes/requests'));
app.use('/api/notifications',require('./routes/notifications'));
app.use('/api/feedback',     require('./routes/feedback'));
app.use('/api/categories',   require('./routes/categories'));
app.use('/api/videos',       require('./routes/videos'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/recommendations', require('./routes/recommendations'));

// ─── HEALTH CHECK ─────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    version: '2.0.0',
    university: 'Daffodil International University',
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Smart Thesis Hub API — Daffodil International University',
    version: '2.0.0',
    docs: '/api-docs',
    health: '/health',
  });
});

// ─── ERROR HANDLER ────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── START SERVER ─────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Smart Thesis Hub API running`);
  console.log(`   URL:  http://localhost:${PORT}`);
  console.log(`   Env:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB:   ${process.env.MONGO_URI || 'mongodb://localhost:27017/smart_thesis_hub'}\n`);
});

module.exports = { app, httpServer };
