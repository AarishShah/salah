const { getNearbyMasjids } = require('../services/masjid.map.service');
const catchError = require('../utils/catchError');

const getNearby = catchError(async (req, res) => {
    const { lat, lng, radius, withRoutes } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ status: 'failed', message: 'lat and lng are required' });
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const rad = radius ? parseFloat(radius) : 2;
    const routes = withRoutes === 'true';
    const result = await getNearbyMasjids({ latitude, longitude, radius: rad, withRoutes: routes });
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    return res.json(result);
});

module.exports = { getNearby }; 