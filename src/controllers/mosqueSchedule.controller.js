const mosqueScheduleService = require("../services/mosqueSchedule.service");
const catchError = require("../utils/catchError");

// Get schedule with date range filtering
const getScheduleByDateRange = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { startDate, endDate } = req.query;

    const result = await mosqueScheduleService.getScheduleByDateRange(
        mosqueId,
        startDate,
        endDate
    );

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Download schedule in various formats
const downloadSchedule = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { startDate, endDate, fileFormat = 'csv' } = req.query;
    const { userId } = req.user;

    const result = await mosqueScheduleService.downloadSchedule(
        mosqueId,
        startDate,
        endDate,
        fileFormat,
        userId
    );

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    return res.send(result.data);
});

// Get all schedules for a mosque (minimal data, paginated)
const getAllSchedules = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { page = 1, limit = 10, year, generationType } = req.query;
    const { userId } = req.user;

    const result = await mosqueScheduleService.getAllSchedules(
        mosqueId,
        { page: parseInt(page), limit: parseInt(limit), year, generationType },
        userId
    );

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Get full schedule document by ID
const getScheduleById = catchError(async (req, res) => {
    const { mosqueId, scheduleId } = req.params;
    const { userId } = req.user;

    const result = await mosqueScheduleService.getScheduleById(
        mosqueId,
        scheduleId,
        userId
    );

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

// Generate new schedule
const generateSchedule = catchError(async (req, res) => {
    const { mosqueId, year } = req.params;
    const { userId } = req.user;

    const result = await mosqueScheduleService.generateSchedule(
        mosqueId,
        parseInt(year),
        userId
    );

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.status(201).json(result);
});

// Update special events in existing schedule
const updateSpecialEvents = catchError(async (req, res) => {
    const { scheduleId } = req.params;
    const { userId } = req.user;

    const result = await mosqueScheduleService.updateSpecialEvents(
        scheduleId,
        userId
    );

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Delete schedule
const deleteSchedule = catchError(async (req, res) => {
    const { scheduleId } = req.params;
    const { userId } = req.user;

    const result = await mosqueScheduleService.deleteSchedule(
        scheduleId,
        userId
    );

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

module.exports = {
    getScheduleByDateRange,
    downloadSchedule,
    getAllSchedules,
    getScheduleById,
    generateSchedule,
    updateSpecialEvents,
    deleteSchedule
};