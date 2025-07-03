const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Database connection
require("./db/mongoose");

// Route imports
const authRoutes = require("./routes/auth.routes");
// const userRoutes = require("./routes/user.routes");
// const timingConfigRoutes = require("./routes/mosqueTimingConfig.routes");
// const prayerTimingRoutes = require("./routes/prayerTiming.routes");
// const editorRequestRoutes = require("./routes/editorRequest.routes");

// Initialize app
const app = express();
const port = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/timing-config', timingConfigRoutes);
// app.use('/api/prayer-timings', prayerTimingRoutes);
// app.use('/api/editor-requests', editorRequestRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'failed',
    message: 'Route not found mate :/'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'failed',
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'failed',
      message: 'Invalid token'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    status: 'failed',
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`SALAH server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;