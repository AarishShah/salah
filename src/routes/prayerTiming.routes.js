const express = require('express');
const router = express.Router();
const controller = require('../controllers/prayerTiming.controller');
const Auth = require('../middleware/auth.middleware');

// Public routes (no auth required)
router.get('/mosque/:mosqueId', controller.getMosqueTimings);
router.get('/mosque/:mosqueId/date/:date', controller.getTimingByDate);
router.get('/mosque/:mosqueId/month/:year/:month', controller.getMonthlyView);

// Protected routes (editor/admin only)
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true });

// Update specific date timing
router.patch('/mosque/:mosqueId/date/:date', editorAuth, controller.updateSpecificDate);

module.exports = router;