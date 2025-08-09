const express = require("express");
const router = express.Router();

const controller = require("../controllers/mosqueMeeqat.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true });
const allAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// --- Mosque Meeqat Routes ---

// Read mosque meeqat with date range and format options
// Query params: startDate, endDate, timeFormat (12h|24h|original, default: 12h)
router.get("/:mosqueId", allAuth, controller.getMosqueMeeqat);

// Download HTML file with same filtering options
// Query params: startDate, endDate, timeFormat (12h|24h|original, default: 12h)
router.get("/:mosqueId/download-html", allAuth, controller.downloadMeeqatHTML);

// Generate new mosque meeqat
router.post("/generate/:mosqueId", editorAuth, controller.generateMosqueMeeqat);

// Approve mosque meeqat (admin or assigned editor only)
router.patch("/approve/:mosqueId", editorAuth, controller.approveMosqueMeeqat);

// Update specific day timings or bulk updates
router.patch("/:mosqueId", editorAuth, controller.updateMosqueMeeqat);

// Permanently delete mosque meeqat
router.delete("/:mosqueId", editorAuth, controller.deleteMosqueMeeqat);

module.exports = router;