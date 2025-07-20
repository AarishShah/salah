const timingService = require('../services/prayerTiming.service');
const catchError = require('../utils/catchError');

const getMosqueTimings = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { year, month, startDate, endDate } = req.query;

    const result = await timingService.getMosqueTimings(mosqueId, {
        year,
        month,
        startDate,
        endDate
    });

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

const getTimingByDate = catchError(async (req, res) => {
    const { mosqueId, date } = req.params;

    const result = await timingService.getTimingByDate(mosqueId, date);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

const getMonthlyView = catchError(async (req, res) => {
    const { mosqueId, year, month } = req.params;

    const result = await timingService.getMonthlyView(
        mosqueId,
        parseInt(year),
        parseInt(month)
    );

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

const updateSpecificDate = catchError(async (req, res) => {
    const { mosqueId, date } = req.params;
    const { userId } = req.user;
    const updateData = req.body;

    const result = await timingService.updateSpecificDate(
        mosqueId,
        date,
        updateData,
        userId
    );

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

module.exports = {
    getMosqueTimings,
    getTimingByDate,
    getMonthlyView,
    updateSpecificDate
};