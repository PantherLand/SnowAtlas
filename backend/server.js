require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const resortsRouter = require('./routes/resorts');
const weatherRouter = require('./routes/weather');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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

// Start server
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

${!process.env.OPENWEATHER_API_KEY ? '⚠️  WARNING: OPENWEATHER_API_KEY not set!' : '✅ OpenWeather API key configured'}
  `);
});

module.exports = app;
