const express = require("express");
const router = express.Router();

const controller = require("../controllers/mosqueMeeqat.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'] });
const allAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// --- MosqueMeeqat Routes ---
router
    .get("/:mosqueId", allAuth, controller.getMosqueMeeqatByMosqueId)
    .post("/generate/:mosqueId", editorAuth, controller.generateMosqueMeeqat)
    .patch("/approve/:mosqueId", editorAuth, controller.approveMosqueMeeqat)
    .patch("/:mosqueId", editorAuth, controller.updateMosqueMeeqatByMosqueId)
    .delete("/:mosqueId", editorAuth, controller.deleteMosqueMeeqatByMosqueId);

module.exports = router;