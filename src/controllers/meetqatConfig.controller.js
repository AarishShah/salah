const meetqatConfigService = require("../services/meetqatConfig.service");
const catchError = require("../utils/catchError");

// Get config by mosque ID
const getConfigByMosqueId = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { role, assignedMosques } = req.user;

    const result = await meetqatConfigService.getConfigByMosqueId(mosqueId, role, assignedMosques);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

// Create new config
const createConfig = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId, role, assignedMosques } = req.user;
    const configData = req.body;

    const result = await meetqatConfigService.createConfig(mosqueId, configData, userId, role, assignedMosques);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.status(201).json(result);
});

// Update config by mosque ID
const updateConfigByMosqueId = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId, role, assignedMosques } = req.user;
    const updateData = req.body;

    const result = await meetqatConfigService.updateConfigByMosqueId(mosqueId, updateData, userId, role, assignedMosques);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Delete config by mosque ID
const deleteConfigByMosqueId = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { role, assignedMosques } = req.user;

    const result = await meetqatConfigService.deleteConfigByMosqueId(mosqueId, role, assignedMosques);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

module.exports = {
    getConfigByMosqueId,
    createConfig,
    updateConfigByMosqueId,
    deleteConfigByMosqueId
};