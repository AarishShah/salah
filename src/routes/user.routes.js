const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware for any authenticated user
const userAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// --- User Routes ---
// These routes are for managing one's own profile and requests.

router
    .get("/profile", userAuth, controller.getProfile)
    .put("/profile", userAuth, controller.updateProfile)
    .delete("/account", userAuth, controller.deleteAccount)
    .post("/editor-request", userAuth, controller.createEditorRequest)
    .get("/editor-request/status", userAuth, controller.getEditorRequestStatus)
    .patch("/phone-verification", userAuth, controller.verifyPhoneStatus);

module.exports = router;