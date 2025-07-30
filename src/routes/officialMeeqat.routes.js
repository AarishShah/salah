const express = require("express");
const router = express.Router();

const controller = require("../controllers/officialMeeqat.controller");
const Auth = require("../middleware/auth.middleware");
const { upload } = require("../utils/upload");
const { uploadRateLimiter } = require("../utils/rateLimiter");

// Middleware
const adminAuth = Auth({ allowedRoles: ['admin'] });
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'] }); // added editorAuth for editor access
const allAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// --- User Routes ---
router
    .get("/:officialMeeqatId", allAuth, controller.getOfficialMeeqatById);

// --- Admin Routes ---
router
    .get("/", editorAuth, controller.getAllOfficialMeeqats)  // changes to editorAuth from adminAuth
    .post("/", adminAuth, uploadRateLimiter, upload.single('csvFile'), controller.createOfficialMeeqat)
    .put("/:officialMeeqatId", adminAuth, uploadRateLimiter, upload.single('csvFile'), controller.updateOfficialMeeqat);

module.exports = router;