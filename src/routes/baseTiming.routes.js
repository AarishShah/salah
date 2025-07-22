const express = require('express');
const router = express.Router();
const Auth = require('../middleware/auth.middleware');
const controller = require('../controllers/baseTiming.controller');
const { upload } = require('../utils/upload');

const adminAuth = Auth({ allowedRoles: ['admin'] });

/**
 * @swagger
 * /api/base-timing/upload:
 *   post:
 *     summary: Upload base timing CSV file
 *     tags: [BaseTiming]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Base timing uploaded
 */
// POST /api/base-timing/upload
router.post('/upload', adminAuth, upload.single('file'), controller.uploadBaseTiming);

module.exports = router; 