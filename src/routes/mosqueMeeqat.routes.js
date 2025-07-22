const express = require("express");
const router = express.Router();

const controller = require("../controllers/mosqueMeeqat.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'] });
const allAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// --- MosqueMeeqat Routes ---
/**
 * @swagger
 * /api/mosqueMeeqat/{mosqueId}:
 *   get:
 *     summary: Get mosque Meeqat by mosque ID
 *     tags: [MosqueMeeqat]
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
 *         description: Mosque Meeqat data
 *   patch:
 *     summary: Update mosque Meeqat by mosque ID
 *     tags: [MosqueMeeqat]
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
 *         description: Mosque Meeqat updated
 *   delete:
 *     summary: Delete mosque Meeqat by mosque ID
 *     tags: [MosqueMeeqat]
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
 *         description: Mosque Meeqat deleted
 *
 * /api/mosqueMeeqat/generate/{mosqueId}:
 *   post:
 *     summary: Generate mosque Meeqat
 *     tags: [MosqueMeeqat]
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
 *         description: Mosque Meeqat generated
 *
 * /api/mosqueMeeqat/approve/{mosqueId}:
 *   patch:
 *     summary: Approve mosque Meeqat
 *     tags: [MosqueMeeqat]
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
 *         description: Mosque Meeqat approved
 *
 * /api/mosqueMeeqat/{mosqueId}/html:
 *   get:
 *     summary: Get mosque Meeqat HTML
 *     tags: [MosqueMeeqat]
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
 *         description: Mosque Meeqat HTML
 */
router
    .get("/:mosqueId", allAuth, controller.getMosqueMeeqatByMosqueId)
    .post("/generate/:mosqueId", editorAuth, controller.generateMosqueMeeqat)
    .patch("/approve/:mosqueId", editorAuth, controller.approveMosqueMeeqat)
    .patch("/:mosqueId", editorAuth, controller.updateMosqueMeeqatByMosqueId)
    .delete("/:mosqueId", editorAuth, controller.deleteMosqueMeeqatByMosqueId);

// Dummy route for HTML generation
router.get("/:mosqueId/html", allAuth, controller.getMosqueMeeqatHTML);

module.exports = router;