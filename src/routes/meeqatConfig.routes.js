const express = require("express");
const router = express.Router();

const controller = require("../controllers/meeqatConfig.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware for editors and admins
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'] });

// --- MeeqatConfig Routes ---
/**
 * @swagger
 * /api/meeqat-config/{mosqueId}:
 *   get:
 *     summary: Get Meeqat config by mosque ID
 *     tags: [MeeqatConfig]
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
 *         description: Meeqat config data
 *   patch:
 *     summary: Update Meeqat config by mosque ID
 *     tags: [MeeqatConfig]
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
 *         description: Meeqat config updated
 *   delete:
 *     summary: Delete Meeqat config by mosque ID
 *     tags: [MeeqatConfig]
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
 *         description: Meeqat config deleted
 *
 * /api/meeqat-config/create/{mosqueId}:
 *   post:
 *     summary: Create Meeqat config for mosque
 *     tags: [MeeqatConfig]
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
 *         description: Meeqat config created
 */
router
    .get("/:mosqueId", editorAuth, controller.getConfigByMosqueId)
    .post("/create/:mosqueId", editorAuth, controller.createConfig)
    .patch("/:mosqueId", editorAuth, controller.updateConfigByMosqueId)
    .delete("/:mosqueId", editorAuth, controller.deleteConfigByMosqueId);

module.exports = router;