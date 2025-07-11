const express = require("express");
const router = express.Router();

const controller = require("../controllers/editor.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware for editors and admins
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'] });

// --- Editor Routes ---
// Routes for editors to manage their assigned resources.

router
    .get("/assigned-mosques", editorAuth, controller.getAssignedMosques);

module.exports = router;