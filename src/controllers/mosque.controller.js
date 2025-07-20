const service = require('../services/mosque.service');
const catchError = require('../utils/catchError');

const getNearbyMosques = catchError(async (req, res) => {
    const { lat, lng, radius, withRoutes } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ status: 'failed', code: 400, message: 'lat and lng are required' });
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const rad = radius ? parseFloat(radius) : 2;
    const routes = withRoutes === 'true';
    const result = await service.getNearbyMosques({ latitude, longitude, radius: rad, withRoutes: routes });
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    return res.json(result);
});

// Properly implemented
const getMosqueById = catchError(async (req, res) => {
    const { id } = req.params;
    const userRole = req.user?.role || 'user';
    const userId = req.user?.userId;
    const result = await service.getMosqueById(id, userId);
    if (result.status === 'failed') {
        // Not found: same message for all roles
        return res.status(404).json({
            status: 'failed',
            message: 'This mosque is not yet registered with us.'
        });
    }
    const { mosque, isActive, isAssignedEditor } = result;
    // Case 1: isActive === true
    if (isActive) {
        return res.json({
            status: 'success',
            mosque
        });
    }
    // Case 2: isActive === false
    if (userRole === 'admin') {
        return res.json({
            status: 'success',
            warning: 'This mosque is currently inactive because some required fields are missing.',
            mosque
        });
    }
    if (userRole === 'editor') {
        if (isAssignedEditor) {
            return res.json({
                status: 'success',
                warning: 'This mosque is currently inactive because some required fields are missing.',
                mosque
            });
        } else {
            return res.json({
                status: 'success',
                message: 'This mosque is currently not being maintained by our system.'
            });
        }
    }
    // For users (and all other cases)
    return res.json({
        status: 'success',
        message: 'This mosque is currently not being maintained by our system.'
    });
});

// Properly implemented
const searchMosques = catchError(async (req, res) => {
    // Ensure page and limit are always numbers with defaults
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const result = await service.searchMosques({ ...req.query, page, limit });
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    return res.json(result);
});

// Properly implemented
const createMosque = catchError(async (req, res) => {
    // Only allow these fields from admin
    const allowedFields = ['name', 'address', 'locality', 'coordinates', 'sect', 'schoolOfThought'];
    const mosqueData = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            mosqueData[field] = req.body[field];
        }
    }
    // Set createdBy from the authenticated user
    mosqueData.createdBy = req.user.userId;
    const result = await service.createMosque(mosqueData);
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    return res.json(result);
});

const softDeleteMosque = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await service.softDeleteMosque(id);
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    return res.json(result);
});

module.exports = {
    getNearbyMosques,
    getMosqueById,
    searchMosques,
    createMosque,
    softDeleteMosque,
}; 