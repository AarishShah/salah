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

const getMosqueById = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await service.getMosqueById(id);
    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }
    return res.json(result);
});

const searchMosques = catchError(async (req, res) => {
    const result = await service.searchMosques(req.query);
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    return res.json(result);
});

const getEditorAssignedMosques = catchError(async (req, res) => {
    const { userId } = req.user;
    const result = await service.getEditorAssignedMosques(userId);
    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }
    return res.json(result);
});

const getAllMosques = catchError(async (req, res) => {
    const result = await service.getAllMosques();
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    return res.json(result);
});

const createMosque = catchError(async (req, res) => {
    const result = await service.createMosque(req.body);
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    return res.json(result);
});

const updateMosque = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await service.updateMosque(id, req.body, req.user);
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    return res.json(result);
});

const deleteMosque = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await service.deleteMosque(id);
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    return res.json(result);
});

module.exports = {
    getNearbyMosques,
    getMosqueById,
    searchMosques,
    getEditorAssignedMosques,
    getAllMosques,
    createMosque,
    updateMosque,
    deleteMosque,
}; 