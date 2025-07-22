const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware for any authenticated user
const userAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// --- User Routes ---
// These routes are for managing one's own profile and requests.

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *   put:
 *     summary: Update current user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated user profile
 *   delete:
 *     summary: Delete current user's account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 */
router
    .get("/profile", userAuth, controller.getProfile)
    .put("/profile", userAuth, controller.updateProfile)
    .delete("/account", userAuth, controller.deleteAccount)

/**
 * @swagger
 * /api/users/editor-request:
 *   post:
 *     summary: Request to become an editor for mosques
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mosqueIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Editor request submitted
 *
 * /api/users/editor-request/status:
 *   get:
 *     summary: Get status of editor request
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Editor request status
 */
    .post("/editor-request", userAuth, controller.createEditorRequest)
    .get("/editor-request/status", userAuth, controller.getEditorRequestStatus)

/**
 * @swagger
 * /api/users/phone-verification:
 *   patch:
 *     summary: Verify phone status
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Phone verification status
 */
    .patch("/phone-verification", userAuth, controller.verifyPhoneStatus);

module.exports = router;