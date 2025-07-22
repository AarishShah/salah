const express = require('express');
const router = express.Router();
const controller = require('../controllers/mosqueTimingConfig.controller');
const Auth = require('../middleware/auth.middleware');

// Middleware
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true });

// Get configuration for a mosque
/**
 * @swagger
 * /api/mosqueTimingConfig/mosque/{mosqueId}:
 *   get:
 *     summary: Get timing config for a mosque
 *     tags: [MosqueTimingConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mosqueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timing config data
 */
router.get('/mosque/:mosqueId', editorAuth, controller.getConfig);

// Create or update configuration
/**
 * @swagger
 * /api/mosqueTimingConfig/mosque/{mosqueId}:
 *   post:
 *     summary: Create or update timing config for a mosque
 *     tags: [MosqueTimingConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mosqueId
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
 *         description: Timing config created/updated
 */
router.post('/mosque/:mosqueId', editorAuth, controller.createOrUpdateConfig);

// Generate prayer timings for the year
/**
 * @swagger
 * /api/mosqueTimingConfig/mosque/{mosqueId}/generate:
 *   post:
 *     summary: Generate prayer timings for the year
 *     tags: [MosqueTimingConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mosqueId
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
 *         description: Prayer timings generated
 */
router.post('/mosque/:mosqueId/generate', editorAuth, controller.generateTimings);

// Preview generated timings (without saving)
/**
 * @swagger
 * /api/mosqueTimingConfig/mosque/{mosqueId}/preview:
 *   post:
 *     summary: Preview generated timings (without saving)
 *     tags: [MosqueTimingConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mosqueId
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
 *         description: Preview of generated timings
 */
router.post('/mosque/:mosqueId/preview', editorAuth, controller.previewTimings);

module.exports = router;