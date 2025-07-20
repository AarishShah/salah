const mosqueMeeqatService = require("../services/mosqueMeeqat.service");
const catchError = require("../utils/catchError");

// Get mosqueMeeqat by mosque ID
const getMosqueMeeqatByMosqueId = catchError(async (req, res) => {
    const { mosqueId } = req.params;

    const result = await mosqueMeeqatService.getMosqueMeeqatByMosqueId(mosqueId);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

// Generate new mosqueMeeqat
const generateMosqueMeeqat = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId, role, assignedMosques } = req.user;

    const result = await mosqueMeeqatService.generateMosqueMeeqat(mosqueId, userId, role, assignedMosques);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.status(201).json(result);
});

// Approve mosqueMeeqat
const approveMosqueMeeqat = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId, role, assignedMosques } = req.user;

    const result = await mosqueMeeqatService.approveMosqueMeeqat(mosqueId, userId, role, assignedMosques);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Update mosqueMeeqat by mosque ID
const updateMosqueMeeqatByMosqueId = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId, role, assignedMosques } = req.user;
    const updateData = req.body;

    const result = await mosqueMeeqatService.updateMosqueMeeqatByMosqueId(mosqueId, updateData, userId, role, assignedMosques);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Delete mosqueMeeqat by mosque ID
const deleteMosqueMeeqatByMosqueId = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { role, assignedMosques } = req.user;

    const result = await mosqueMeeqatService.deleteMosqueMeeqatByMosqueId(mosqueId, role, assignedMosques);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

module.exports = {
    getMosqueMeeqatByMosqueId,
    generateMosqueMeeqat,
    approveMosqueMeeqat,
    updateMosqueMeeqatByMosqueId,
    deleteMosqueMeeqatByMosqueId
};