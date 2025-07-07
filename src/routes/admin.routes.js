const express = require("express");
const router = express.Router();

const controller = require("../controllers/admin.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware for admin users only
const adminAuth = Auth({ allowedRoles: ['admin'] });

// --- Admin Routes ---
// Routes for admins to manage all users, roles, and requests.

router
    .get("/", adminAuth, controller.getAllUsers)
    .get("/stats", adminAuth, controller.getUserStats)
    .get("/editors", adminAuth, controller.getAllEditors)
    .get("/editor-requests", adminAuth, controller.getEditorRequests)
    .put("/editor-requests/:requestId", adminAuth, controller.handleEditorRequest)
    .get("/:userId", adminAuth, controller.getUser)
    .put("/:userId/role", adminAuth, controller.updateUserRole)
    .put("/:userId/status", adminAuth, controller.updateUserStatus)
    .put("/:userId/mosques", adminAuth, controller.updateUserMosques);

module.exports = router;