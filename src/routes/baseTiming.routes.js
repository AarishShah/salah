const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Auth = require('../middleware/auth.middleware');
const controller = require('../controllers/baseTiming.controller');

// Multer setup for CSV upload
const upload = multer({
    dest: path.join(__dirname, '../../uploads'),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

const adminAuth = Auth({ allowedRoles: ['admin'] });

// POST /api/base-timing/upload
router.post('/upload', adminAuth, upload.single('file'), controller.uploadBaseTiming);

module.exports = router; 