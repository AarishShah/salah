const express = require("express");
const router = express.Router();

const controller = require("../controllers/officialMeeqat.controller");
const Auth = require("../middleware/auth.middleware");
const { upload } = require("../utils/upload");
const { uploadRateLimiter } = require("../utils/rateLimiter");

// Middleware
const adminAuth = Auth({ allowedRoles: ['admin'] });
const allAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// --- User Routes ---
router
    .get("/:id", allAuth, controller.getOfficialMeeqatById);

// --- Admin Routes ---
router
    .get("/", adminAuth, controller.getAllOfficialMeeqats)
    .post("/", adminAuth, uploadRateLimiter, upload.single('csvFile'), controller.createOfficialMeeqat)
    .put("/:id", adminAuth, uploadRateLimiter, upload.single('csvFile'), controller.updateOfficialMeeqat);

module.exports = router;