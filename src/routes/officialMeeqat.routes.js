const express = require("express");
const router = express.Router();
const multer = require("multer");

const controller = require("../controllers/officialMeeqat.controller");
const Auth = require("../middleware/auth.middleware");

// Configure multer for CSV uploads
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware
const adminAuth = Auth({ allowedRoles: ['admin'] });
const allAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// Routes
router
    .get("/", adminAuth, controller.getAllOfficialMeeqats)
    .get("/:id", allAuth, controller.getOfficialMeeqatById)
    .post("/", adminAuth, upload.single('csvFile'), controller.createOfficialMeeqat)
    .put("/:id", adminAuth, upload.single('csvFile'), controller.updateOfficialMeeqat);

module.exports = router;