const express = require('express');
const router = express.Router();
const controller = require('../controllers/mosqueTimingConfig.controller');
const Auth = require('../middleware/auth.middleware');

// Middleware
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true });

// Get configuration for a mosque
router.get('/mosque/:mosqueId', editorAuth, controller.getConfig);

// Create or update configuration
router.post('/mosque/:mosqueId', editorAuth, controller.createOrUpdateConfig);

// Generate prayer timings for the year
router.post('/mosque/:mosqueId/generate', editorAuth, controller.generateTimings);

// Preview generated timings (without saving)
router.post('/mosque/:mosqueId/preview', editorAuth, controller.previewTimings);

module.exports = router;