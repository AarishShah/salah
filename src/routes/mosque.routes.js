const express = require('express');
const router = express.Router();
const controller = require('../controllers/mosque.controller');
const Auth = require('../middleware/auth.middleware');

const userAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'] });
const adminAuth = Auth({ allowedRoles: ['admin'] });

// --- User routes ---
router
    .get('/map/nearby', userAuth, controller.getNearbyMosques)
    .get('/search', userAuth, controller.searchMosques)
    .get('/:id', userAuth, controller.getMosqueById);

// For everybody get id's of multiple mosque

// --- Editor routes ---
router
    .patch('/editor/:id/official-meeqat', editorAuth, controller.setOfficialMeeqat);
    
// --- Admin routes ---
router
    .post('/admin/create', adminAuth, controller.createMosque)
    .delete('/admin/:id', adminAuth, controller.softDeleteMosque);

module.exports = router; 