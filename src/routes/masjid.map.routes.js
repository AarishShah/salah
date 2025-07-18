const express = require('express');
const router = express.Router();
const controller = require('../controllers/masjid.map.controller');

router.get('/map/nearby', controller.getNearbyMosques);

module.exports = router; 