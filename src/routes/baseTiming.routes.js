const express = require('express');
const router = express.Router();
const Auth = require('../middleware/auth.middleware');
const controller = require('../controllers/baseTiming.controller');
const { upload } = require('../utils/upload');

const adminAuth = Auth({ allowedRoles: ['admin'] });

// POST /api/base-timing/upload
router.post('/upload', adminAuth, upload.single('file'), controller.uploadBaseTiming);

module.exports = router;