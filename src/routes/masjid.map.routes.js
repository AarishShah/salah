const express = require('express');
const router = express.Router();
const controller = require('../controllers/masjid.map.controller');

// GET /api/masjid/map/nearby?lat=...&lng=...&radius=...&withRoutes=...
router.get('/map/nearby', controller.getNearby);

module.exports = router; 