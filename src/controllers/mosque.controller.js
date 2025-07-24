const mosqueService = require('../services/mosque.service');
const catchError = require('../utils/catchError');

// Get nearby mosques
const getNearbyMosques = catchError(async (req, res) => {
    const {
        lat,
        lng,
        radius = 2,
        withRoutes = false
    } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Latitude and longitude are required'
        });
    }

    const filters = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius: parseFloat(radius),
        withRoutes: withRoutes === 'true'
    };

    const result = await mosqueService.getNearbyMosques(filters);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Search mosques with filters and pagination
const searchMosques = catchError(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        name,
        locality,
        sect,
        schoolOfThought,
        address,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    const filters = {
        name,
        locality,
        sect,
        schoolOfThought,
        address,
        isActive
    };

    const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
    };

    const result = await mosqueService.searchMosques(filters, pagination);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Get mosque by ID
const getMosqueById = catchError(async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.user;

    const result = await mosqueService.getMosqueById(id, userId, role);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

// Set official meeqat for mosque
const setOfficialMeeqat = catchError(async (req, res) => {
    const { id } = req.params;
    const { officialMeeqatId } = req.body;
    const { userId, role } = req.user;

    if (!officialMeeqatId) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Official Meeqat ID is required'
        });
    }

    const data = {
        mosqueId: id,
        officialMeeqatId,
        userId,
        userRole: role
    };

    const result = await mosqueService.setOfficialMeeqat(data);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Create new mosque
const createMosque = catchError(async (req, res) => {
    const { userId } = req.user;
    const { name, address, locality, coordinates, sect, schoolOfThought } = req.body;

    const data = {
        name,
        address,
        locality,
        coordinates,
        sect,
        schoolOfThought,
        createdBy: userId
    };

    const result = await mosqueService.createMosque(data);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.status(201).json(result);
});

// Soft delete mosque
const softDeleteMosque = catchError(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    const result = await mosqueService.softDeleteMosque(id, userId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

module.exports = {
    getNearbyMosques,
    searchMosques,
    getMosqueById,
    setOfficialMeeqat,
    createMosque,
    softDeleteMosque
};