const express = require('express');
const router = express.Router();
const swaggerSpec = require('../swagger/config');
const { healthCheck, notFoundHandler, globalErrorHandler } = require('../middleware/routeHandlers');

// Route imports
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const editorRequestRoutes = require("./editorRequest.routes");
const adminRoutes = require("./admin.routes");
const mosqueMapRoutes = require('./mosque.routes');
const officialMeeqatRoutes = require("./officialMeeqat.routes");
const meeqatConfigRoutes = require("./meeqatConfig.routes");
const mosqueMeeqatRoutes = require("./mosqueMeeqat.routes");
const mosqueSpecialEventRoutes = require("./mosqueSpecialEvent.routes");
const mosqueScheduleRoutes = require("./mosqueSchedule.routes");
const pushNotificationRoutes = require("./pushNotification.routes");
const favoritesMosqueRoutes = require("./favoritesMosque.routes");
const swaggerRoutes = require('./swagger.routes');

// Health check endpoint
router.get('/health', healthCheck);

// API Routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/editorRequest', editorRequestRoutes); // might need to move this to user routes
router.use('/api/admin', adminRoutes);
router.use('/api/mosque', mosqueMapRoutes);
router.use('/api/official-meeqat', officialMeeqatRoutes);
router.use('/api/meeqat-config', meeqatConfigRoutes);
router.use('/api/mosqueMeeqat', mosqueMeeqatRoutes); // don't use camelCase for route names, instead use kebab-case
router.use('/api/mosque-special-events', mosqueSpecialEventRoutes);
router.use('/api/mosque-schedule', mosqueScheduleRoutes);
router.use('/api/notifications', pushNotificationRoutes);
router.use('/api/favorites-mosques', favoritesMosqueRoutes);

// Documentation routes
router.use('/api/docs', swaggerRoutes);
router.get('/api/swagger.json', (req, res) => res.json(swaggerSpec));

// 404 handler - catches all unmatched routes
router.use(notFoundHandler);

// Global error handler - must be last
router.use(globalErrorHandler);

module.exports = router;