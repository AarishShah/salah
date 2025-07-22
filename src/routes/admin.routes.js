const express = require("express");
const router = express.Router();

const controller = require("../controllers/admin.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware for admin users only
const adminAuth = Auth({ allowedRoles: ['admin'] });

// --- Admin Routes ---
// Routes for admins to manage all users, roles, and requests.

/**
 * @swagger
 * /api/admin/all:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *
 * /api/admin/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *
 * /api/admin/editors:
 *   get:
 *     summary: Get all editors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of editors
 *
 * /api/admin/editor-requests:
 *   get:
 *     summary: Get all editor requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of editor requests
 *
 * /api/admin/editor-requests/{requestId}:
 *   put:
 *     summary: Handle an editor request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
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
 *         description: Editor request handled
 *
 * /api/admin/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *   put:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: User role updated
 *
 * /api/admin/{userId}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: User status updated
 *
 * /api/admin/{userId}/mosques:
 *   put:
 *     summary: Update user's mosques
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: User mosques updated
 */

router
    .get("/all", adminAuth, controller.getAllUsers)
    .get("/stats", adminAuth, controller.getUserStats)
    .get("/editors", adminAuth, controller.getAllEditors)
    .get("/editor-requests", adminAuth, controller.getEditorRequests)
    .put("/editor-requests/:requestId", adminAuth, controller.handleEditorRequest)
    .get("/:userId", adminAuth, controller.getUser)
    .put("/:userId/role", adminAuth, controller.updateUserRole)
    .put("/:userId/status", adminAuth, controller.updateUserStatus)
    .put("/:userId/mosques", adminAuth, controller.updateUserMosques);

module.exports = router;