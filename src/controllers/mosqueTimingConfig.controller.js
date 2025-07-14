const configService = require('../services/mosqueTimingConfig.service');
const catchError = require('../utils/catchError');

const getConfig = catchError(async (req, res) => {
    const { mosqueId } = req.params;

    const result = await configService.getConfig(mosqueId);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

const createOrUpdateConfig = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId } = req.user;
    const configData = req.body;

    const result = await configService.createOrUpdateConfig(
        mosqueId,
        configData,
        userId
    );

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

const generateTimings = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId } = req.user;
    const { year } = req.body;

    const result = await configService.generateTimings(
        mosqueId,
        year || new Date().getFullYear(),
        userId
    );

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

const previewTimings = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { days = 7 } = req.body; // Preview first 7 days by default

    const result = await configService.previewTimings(mosqueId, days);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

module.exports = {
    getConfig,
    createOrUpdateConfig,
    generateTimings,
    previewTimings
};