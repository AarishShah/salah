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

/**
 * @swagger
 * /api/mosque/map/nearby:
 *   get:
 *     summary: Get nearby mosques
 *     tags: [Mosque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of nearby mosques
 *
 * /api/mosque/search:
 *   get:
 *     summary: Search mosques
 *     tags: [Mosque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 *
 * /api/mosque/{id}:
 *   get:
 *     summary: Get mosque by ID
 *     tags: [Mosque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mosque data
 *
 * /api/mosque/editor/{id}/official-meeqat:
 *   patch:
 *     summary: Set official Meeqat for mosque (editor)
 *     tags: [Mosque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Official Meeqat set
 *
 * /api/mosque/admin/create:
 *   post:
 *     summary: Create mosque (admin)
 *     tags: [Mosque]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Mosque created
 *
 * /api/mosque/admin/{id}:
 *   delete:
 *     summary: Soft delete mosque (admin)
 *     tags: [Mosque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mosque deleted
 */

module.exports = router; 