const express = require("express");
const router = express.Router();

const controller = require("../controllers/editorRequest.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware for editors and admins
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'] });

// --- Editor Routes ---
// Routes for editors to manage their assigned resources.

/**
 * @swagger
 * /api/editorRequest/assigned-mosques:
 *   get:
 *     summary: Get assigned mosques for editor
 *     tags: [EditorRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned mosques
 */
router
    .get("/assigned-mosques", editorAuth, controller.getAssignedMosques);

module.exports = router;