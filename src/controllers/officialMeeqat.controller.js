const officialMeeqatService = require("../services/officialMeeqat.service");
const catchError = require("../utils/catchError");

// Get all official meeqats with pagination and filters
const getAllOfficialMeeqats = catchError(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        locationName,
        sect,
        schoolOfThought,
        publisher,
        createdAtFrom,
        createdAtTo,
        updatedAtFrom,
        updatedAtTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    const filters = {
        locationName,
        sect,
        schoolOfThought,
        publisher,
        createdAtFrom,
        createdAtTo,
        updatedAtFrom,
        updatedAtTo
    };

    const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
    };

    const result = await officialMeeqatService.getAllOfficialMeeqats(filters, pagination);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Get official meeqat by ID
const getOfficialMeeqatById = catchError(async (req, res) => {
    const { id } = req.params;

    const result = await officialMeeqatService.getOfficialMeeqatById(id);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

// Create new official meeqat
const createOfficialMeeqat = catchError(async (req, res) => {
    const { userId } = req.user;
    const { locationName, sect, schoolOfThought, publisher, coordinates } = req.body;

    if (!req.file) {
        return res.status(400).json({
            status: 'failed',
            message: 'CSV file is required'
        });
    }

    const data = {
        locationName,
        sect,
        schoolOfThought,
        publisher,
        coordinates,
        csvBuffer: req.file.buffer,
        createdBy: userId
    };

    const result = await officialMeeqatService.createOfficialMeeqat(data);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.status(201).json(result);
});

// Update official meeqat
const updateOfficialMeeqat = catchError(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const { publisher, coordinates } = req.body;

    const updateData = {
        publisher,
        coordinates,
        updatedBy: userId
    };

    // If CSV file is provided, include it for timing update
    if (req.file) {
        updateData.csvBuffer = req.file.buffer;
    }

    const result = await officialMeeqatService.updateOfficialMeeqat(id, updateData);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

module.exports = {
    getAllOfficialMeeqats,
    getOfficialMeeqatById,
    createOfficialMeeqat,
    updateOfficialMeeqat
};