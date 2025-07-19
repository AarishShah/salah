const express = require('express');
const router = express.Router();
const controller = require('../controllers/mosque.controller');
const Auth = require('../middleware/auth.middleware');

const userAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'] });
const adminAuth = Auth({ allowedRoles: ['admin'] });

router.get('/map/nearby', controller.getNearbyMosques); // this route is public, should be user, editor, admin

/*

    Add more mosque-related routes here as needed
    e.g.:
    get by id for all users
    get by search query. name, sect, locality, etc. for all users
    get all editor mosques by editor only
    get all mosques by admin only
    create mosque by admin only, admin would see on map and should be able to fill a form to add mosque
    update mosque by editor and admin
    delete mosque by admin

    approved by admin in mosque model, if admin approved then update the isActive field to true, if created
    by editor then update the isActive field to false, it requires admin approval to be active

    keep user, editor, admin routes separate by comments above the routes
    
*/ 

// --- Public/User Routes ---
// Search mosques
router.get('/search', controller.searchMosques);

// Get mosque by id
router.get('/:id', controller.getMosqueById);
// --- Editor Routes ---
// Get all mosques assigned to the editor
router.get('/editor/assigned', editorAuth, controller.getEditorAssignedMosques);
// Update mosque (editor and admin)
router.put('/:id', editorAuth, controller.updateMosque);

// --- Admin Routes ---
// Get all mosques (admin only)
router.get('/admin/all', adminAuth, controller.getAllMosques);
// Create mosque (admin only)
router.post('/admin/create', adminAuth, controller.createMosque);
// Delete mosque (admin only)
router.delete('/admin/:id', adminAuth, controller.deleteMosque);

module.exports = router; 