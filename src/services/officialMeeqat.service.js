const OfficialMeeqat = require('../models/officialMeeqat.model');
const { parseCSVBuffer, validateCSVData, convertCSVToTimings } = require('../helpers/parseCSVBuffer');
const { formatTime } = require("../helpers/officialMeeqatFormatter.helper");

// Get all official meeqats with filters
const getAllOfficialMeeqats = async (filters, pagination) => {
    try {
        const { page, limit, sortBy, sortOrder } = pagination;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        if (filters.locationName) {
            query.locationName = { $regex: filters.locationName, $options: 'i' };
        }

        if (filters.sect) {
            query.sect = filters.sect;
        }

        if (filters.schoolOfThought) {
            query.schoolOfThought = filters.schoolOfThought;
        }

        if (filters.publisher) {
            query.publisher = { $regex: filters.publisher, $options: 'i' };
        }

        // Date range filters
        if (filters.createdAtFrom || filters.createdAtTo) {
            query.createdAt = {};
            if (filters.createdAtFrom) {
                query.createdAt.$gte = new Date(filters.createdAtFrom);
            }
            if (filters.createdAtTo) {
                query.createdAt.$lte = new Date(filters.createdAtTo);
            }
        }

        if (filters.updatedAtFrom || filters.updatedAtTo) {
            query.updatedAt = {};
            if (filters.updatedAtFrom) {
                query.updatedAt.$gte = new Date(filters.updatedAtFrom);
            }
            if (filters.updatedAtTo) {
                query.updatedAt.$lte = new Date(filters.updatedAtTo);
            }
        }

        // Execute query
        const [documents, totalCount] = await Promise.all([
            OfficialMeeqat.find(query)
                .select('-timings')
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            OfficialMeeqat.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            status: 'success',
            data: documents,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (error) {
                console.error('GetAllOfficialMeeqats error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch official meeqats'
        };
    }
};

// Get official meeqat by ID with optional format transformation
const getOfficialMeeqatById = async (officialMeeqatId, format = '12h') => {
    try {
        const officialMeeqat = await OfficialMeeqat.findById(officialMeeqatId)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!officialMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'Official meeqat not found'
            };
        }

        let transformedData = officialMeeqat.toObject();
        
        // Early return for original format
        if (format === 'original') {
            return {
                status: 'success',
                data: transformedData,
                format: 'original'
            };
        }

        // Transform timings if they exist
        if (transformedData.timings) {
            const timeFormat = format === '24h' ? '24h' : '12h'; // Default to 12h
            transformedData.timings = formatTime(transformedData.timings, timeFormat);
            
            return {
                status: 'success',
                data: transformedData,
                format: timeFormat // Include format info in response
            };
        }

        // Return data if no timings to transform
        return {
            status: 'success',
            data: transformedData
        };
    } catch (error) {
        console.error('GetOfficialMeeqatById error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch official meeqat'
        };
    }
};

// Create new official meeqat
const createOfficialMeeqat = async (data) => {
    try {
        const { locationName, sect, schoolOfThought, publisher, coordinates, csvBuffer, createdBy } = data;

        // Check if combination already exists
        const existing = await OfficialMeeqat.findOne({ 
            locationName, 
            sect, 
            schoolOfThought 
        });
        
        if (existing) {
            return {
                status: 'failed',
                code: 409,
                message: `Official meeqat already exists for ${locationName} - ${sect} - ${schoolOfThought}`
            };
        }

        // Parse and validate CSV
        const csvData = await parseCSVBuffer(csvBuffer);
        const validation = validateCSVData(csvData);

        if (!validation.isValid) {
            return {
                status: 'failed',
                code: 400,
                message: 'CSV validation failed',
                errors: validation.errors
            };
        }

        // Convert CSV to timings format with smart AM/PM interpretation
        const timings = convertCSVToTimings(csvData);

        // Create new official meeqat
        const newOfficialMeeqat = new OfficialMeeqat({
            locationName,
            sect,
            schoolOfThought,
            publisher,
            coordinates,
            timings,
            createdBy
        });

        await newOfficialMeeqat.save();

        // Return without timings array for response
        const response = await OfficialMeeqat.findById(newOfficialMeeqat._id)
            .select('-timings')
            .populate('createdBy', 'name email');

        return {
            status: 'success',
            message: 'Official meeqat created successfully',
            data: response
        };
    } catch (error) {
        console.error('CreateOfficialMeeqat error:', error);
        
        if (error.name === 'ValidationError') {
            return {
                status: 'failed',
                code: 400,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            };
        }

        return {
            status: 'failed',
            code: 500,
            message: 'Failed to create official meeqat'
        };
    }
};

// Update official meeqat
const updateOfficialMeeqat = async (officialMeeqatId, updateData) => {
    try {
        const { publisher, coordinates, csvBuffer, updatedBy } = updateData;

        // Find existing document
        const existingMeeqat = await OfficialMeeqat.findById(officialMeeqatId);
        if (!existingMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'Official meeqat not found'
            };
        }

        // Prepare update object
        const updateFields = { updatedBy };

        if (publisher !== undefined) {
            updateFields.publisher = publisher;
        }

        if (coordinates !== undefined) {
            updateFields.coordinates = coordinates;
        }

        // If CSV is provided, validate and update timings
        if (csvBuffer) {
            const csvData = await parseCSVBuffer(csvBuffer);
            const validation = validateCSVData(csvData);

            if (!validation.isValid) {
                return {
                    status: 'failed',
                    code: 400,
                    message: 'CSV validation failed',
                    errors: validation.errors
                };
            }

            updateFields.timings = convertCSVToTimings(csvData);
        }

        // Update the document
        const updatedMeeqat = await OfficialMeeqat.findByIdAndUpdate(
            officialMeeqatId,
            updateFields,
            { new: true, runValidators: true }
        )
        .select('-timings')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

        return {
            status: 'success',
            message: 'Official meeqat updated successfully',
            data: updatedMeeqat
        };
    } catch (error) {
        console.error('UpdateOfficialMeeqat error:', error);
        
        if (error.name === 'ValidationError') {
            return {
                status: 'failed',
                code: 400,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            };
        }

        return {
            status: 'failed',
            code: 500,
            message: 'Failed to update official meeqat'
        };
    }
};

module.exports = {
    getAllOfficialMeeqats,
    getOfficialMeeqatById,
    createOfficialMeeqat,
    updateOfficialMeeqat
};