const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");
const Auth = require("../middleware/auth.middleware");

const userAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

/**
 * @swagger
 * /api/auth/google-signin:
 *   post:
 *     summary: Google sign-in
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful sign-in
 *
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Token refreshed
 *
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out
 */

router
    // Public routes - no auth required
    .post("/google-signin", controller.googleSignIn)
    .post("/refresh-token", controller.refreshToken)

    // Protected routes - require authentication
    .post("/logout", userAuth, controller.logout);

module.exports = router;