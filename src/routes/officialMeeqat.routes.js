const express = require("express");
const router = express.Router();

const controller = require("../controllers/officialMeeqat.controller");
const Auth = require("../middleware/auth.middleware");
const { upload } = require("../utils/upload");
const { uploadRateLimiter } = require("../utils/rateLimiter");

// Middleware
const adminAuth = Auth({ allowedRoles: ['admin'] });
const allAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// --- User Routes ---
/**
 * @swagger
 * /api/official-meeqat/{id}:
 *   get:
 *     summary: Get official Meeqat by ID
 *     tags: [OfficialMeeqat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Official Meeqat data
 */
router
    .get("/:id", allAuth, controller.getOfficialMeeqatById);

// --- Admin Routes ---
/**
 * @swagger
 * /api/official-meeqat:
 *   get:
 *     summary: Get all official Meeqats
 *     tags: [OfficialMeeqat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of official Meeqats
 */
router
    .get("/", adminAuth, controller.getAllOfficialMeeqats)
    .post("/", adminAuth, uploadRateLimiter, upload.single('csvFile'), controller.createOfficialMeeqat)
    .put("/:id", adminAuth, uploadRateLimiter, upload.single('csvFile'), controller.updateOfficialMeeqat);

module.exports = router;