const express = require('express');
const router = express.Router();
const controller = require('../controllers/prayerTiming.controller');
const Auth = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/prayer-timings/mosque/{mosqueId}:
 *   get:
 *     summary: Get prayer timings for a mosque
 *     tags: [PrayerTiming]
 *     parameters:
 *       - in: path
 *         name: mosqueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prayer timings data
 *
 * /api/prayer-timings/mosque/{mosqueId}/date/{date}:
 *   get:
 *     summary: Get prayer timing for a specific date
 *     tags: [PrayerTiming]
 *     parameters:
 *       - in: path
 *         name: mosqueId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prayer timing for date
 *   patch:
 *     summary: Update prayer timing for a specific date (editor/admin)
 *     tags: [PrayerTiming]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mosqueId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Prayer timing updated
 *
 * /api/prayer-timings/mosque/{mosqueId}/month/{year}/{month}:
 *   get:
 *     summary: Get monthly prayer timings
 *     tags: [PrayerTiming]
 *     parameters:
 *       - in: path
 *         name: mosqueId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Monthly prayer timings
 */

// Public routes (no auth required)
router.get('/mosque/:mosqueId', controller.getMosqueTimings);
router.get('/mosque/:mosqueId/date/:date', controller.getTimingByDate);
router.get('/mosque/:mosqueId/month/:year/:month', controller.getMonthlyView);

// Protected routes (editor/admin only)
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true });

// Update specific date timing
router.patch('/mosque/:mosqueId/date/:date', editorAuth, controller.updateSpecificDate);

module.exports = router;