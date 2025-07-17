const express = require("express");
const router = express.Router();

const controller = require("../controllers/meetqatConfig.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware for editors and admins
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'] });

// --- MeetqatConfig Routes ---
router
    .get("/:mosqueId", editorAuth, controller.getConfigByMosqueId)
    .post("/create/:mosqueId", editorAuth, controller.createConfig)
    .patch("/:mosqueId", editorAuth, controller.updateConfigByMosqueId)
    .delete("/:mosqueId", editorAuth, controller.deleteConfigByMosqueId);

module.exports = router;