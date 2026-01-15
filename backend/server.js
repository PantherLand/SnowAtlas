require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const resortsRouter = require('./routes/resorts');
const weatherRouter = require('./routes/weather');

const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy - required for getting real IP behind reverse proxies/load balancers
app.set('trust proxy', true);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.headers['cf-connecting-ip']
    || req.socket.remoteAddress
    || req.ip;
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/resorts', resortsRouter);
app.use('/api/weather', weatherRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server only when run directly (avoid open handles in tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║      SnowAtlas Backend Server         ║
╚═══════════════════════════════════════╝

🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📍 API Base URL: http://localhost:${PORT}/api
⏰ Started at: ${new Date().toISOString()}

Available Endpoints:
  GET  /health                    - Health check
  GET  /api/resorts              - Get all resorts
  GET  /api/resorts/nearby       - Get nearest resorts
  GET  /api/resorts/:id          - Get resort by ID
  GET  /api/resorts/country/:cc  - Get resorts by country
  GET  /api/weather/:resortId    - Get weather for resort
  POST /api/weather/batch        - Get weather for multiple resorts

  `);
  });
}

module.exports = app;
