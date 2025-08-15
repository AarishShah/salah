const mosqueSpecialEventService = require("../services/mosqueSpecialEvent.service");
const catchError = require("../utils/catchError");

// Get all year documents for a mosque
const getMosqueSpecialEvents = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    
    const result = await mosqueSpecialEventService.getMosqueSpecialEvents(mosqueId);
    
    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }
    
    return res.json(result);
});

// Get specific year document
const getMosqueSpecialEventsByYear = catchError(async (req, res) => {
    const { mosqueId, year } = req.params;
    
    const result = await mosqueSpecialEventService.getMosqueSpecialEventsByYear(mosqueId, parseInt(year));
    
    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }
    
    return res.json(result);
});

// Admin: Get all special events
const getAllSpecialEvents = catchError(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await mosqueSpecialEventService.getAllSpecialEvents(parseInt(page), parseInt(limit));
    
    if (result.status === 'failed') {
        return res.status(result.code || 500).json(result);
    }
    
    return res.json(result);
});

// Create new year document
const createYearDocument = catchError(async (req, res) => {
    const { mosqueId, year } = req.params;
    const { userId } = req.user;
    
    const result = await mosqueSpecialEventService.createYearDocument(
        mosqueId, 
        parseInt(year), 
        userId
    );
    
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    
    return res.status(201).json(result);
});

// Add event to year document
const addEvent = catchError(async (req, res) => {
    const { mosqueId, year } = req.params;
    const { userId } = req.user;
    const eventData = req.body;
    
    const result = await mosqueSpecialEventService.addEvent(
        mosqueId, 
        parseInt(year), 
        eventData, 
        userId
    );
    
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    
    return res.json(result);
});

// Update specific event
const updateEvent = catchError(async (req, res) => {
    const { mosqueId, year, eventId } = req.params;
    const { userId } = req.user;
    const updateData = req.body;
    
    const result = await mosqueSpecialEventService.updateEvent(
        mosqueId, 
        parseInt(year), 
        eventId, 
        updateData, 
        userId
    );
    
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    
    return res.json(result);
});

// Delete specific event
const deleteEvent = catchError(async (req, res) => {
    const { mosqueId, year, eventId } = req.params;
    const { userId } = req.user;
    
    const result = await mosqueSpecialEventService.deleteEvent(
        mosqueId, 
        parseInt(year), 
        eventId, 
        userId
    );
    
    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }
    
    return res.json(result);
});

module.exports = {
    getMosqueSpecialEvents,
    getMosqueSpecialEventsByYear,
    getAllSpecialEvents,
    createYearDocument,
    addEvent,
    updateEvent,
    deleteEvent
};