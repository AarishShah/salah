const express = require("express");
const router = express.Router();

const controller = require("../controllers/officialMeeqat.controller");
const Auth = require("../middleware/auth.middleware");
const { upload } = require("../utils/upload");

// Middleware
const adminAuth = Auth({ allowedRoles: ['admin'] });
const allAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// --- User Routes ---
router
    .get("/:id", allAuth, controller.getOfficialMeeqatById);

// --- Admin Routes ---
router
    .get("/", adminAuth, controller.getAllOfficialMeeqats)
    .post("/", adminAuth, upload.single('csvFile'), controller.createOfficialMeeqat)
    .put("/:id", adminAuth, upload.single('csvFile'), controller.updateOfficialMeeqat);

module.exports = router;