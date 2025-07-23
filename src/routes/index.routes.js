const express = require('express');
const router = express.Router();
const swaggerSpec = require('../swagger/config');
const { healthCheck, notFoundHandler, globalErrorHandler } = require('../middleware/routeHandlers');

// Route imports
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const editorRequestRoutes = require("./editorRequest.routes");
const adminRoutes = require("./admin.routes");
const timingConfigRoutes = require("./mosqueTimingConfig.routes");
const baseTimingRoutes = require("./baseTiming.routes");
const prayerTimingRoutes = require("./prayerTiming.routes");
const officialMeeqatRoutes = require("./officialMeeqat.routes");
const meeqatConfigRoutes = require("./meeqatConfig.routes");
const mosqueMeeqatRoutes = require("./mosqueMeeqat.routes");
const mosqueMapRoutes = require('./mosque.routes');
const swaggerRoutes = require('./swagger.routes');

// Health check endpoint
router.get('/health', healthCheck);

// API Routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/editorRequest', editorRequestRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/timing-config', timingConfigRoutes);
router.use('/api/base-timing', baseTimingRoutes);
router.use('/api/prayer-timings', prayerTimingRoutes);
router.use('/api/official-meeqat', officialMeeqatRoutes);
router.use('/api/meeqat-config', meeqatConfigRoutes);
router.use('/api/mosqueMeeqat', mosqueMeeqatRoutes);
router.use('/api/mosque', mosqueMapRoutes);

// Documentation routes
router.use('/api/docs', swaggerRoutes);
router.get('/api/swagger.json', (req, res) => res.json(swaggerSpec));

// 404 handler - catches all unmatched routes
router.use(notFoundHandler);

// Global error handler - must be last
router.use(globalErrorHandler);

module.exports = router;