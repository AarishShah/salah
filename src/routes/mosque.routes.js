const express = require('express');
const router = express.Router();

const controller = require('../controllers/mosque.controller');
const Auth = require('../middleware/auth.middleware');

// Middleware
const userAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'] });
const adminAuth = Auth({ allowedRoles: ['admin'] });

// --- User Routes ---
router
    .get('/map/nearby', userAuth, controller.getNearbyMosques)
    .get('/search', userAuth, controller.searchMosques)
    .get('/:id', userAuth, controller.getMosqueById);

// --- Editor Routes ---
router
    .patch('/:id/official-meeqat', editorAuth, controller.setOfficialMeeqat);
    
// --- Admin Routes ---
router
    .post('/', adminAuth, controller.createMosque)
    .delete('/:id', adminAuth, controller.softDeleteMosque);

module.exports = router;