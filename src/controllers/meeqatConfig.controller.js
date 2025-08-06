const meeqatConfigService = require("../services/meeqatConfig.service");
const catchError = require("../utils/catchError");

// Get config by mosque ID
const getConfigByMosqueId = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { format = '12h' } = req.query;

    const result = await meeqatConfigService.getConfigByMosqueId(mosqueId, format);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

// Create new config
const createConfig = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId } = req.user;
    const configData = req.body;

    const result = await meeqatConfigService.createConfig(mosqueId, configData, userId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.status(201).json(result);
});

// Update config by mosque ID
const updateConfigByMosqueId = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId } = req.user;
    const updateData = req.body;

    const result = await meeqatConfigService.updateConfigByMosqueId(mosqueId, updateData, userId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Delete config by mosque ID
const deleteConfigByMosqueId = catchError(async (req, res) => {
    const { mosqueId } = req.params;

    const result = await meeqatConfigService.deleteConfigByMosqueId(mosqueId);

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