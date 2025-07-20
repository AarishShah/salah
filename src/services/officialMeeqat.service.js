const OfficialMeeqat = require('../models/officialMeeqat.model');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

// Helper function to parse CSV from buffer
const parseCSVBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const stream = Readable.from(buffer.toString());

        stream
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

// Validate CSV data
const validateCSVData = (data) => {
    const errors = [];
    const expectedColumns = ['Date', 'Fajr', 'Sunrise', 'Zenith', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    // Check if data exists
    if (!data || data.length === 0) {
        errors.push('CSV file is empty');
        return { isValid: false, errors };
    }

    // Check row count
    if (data.length !== 366) {
        errors.push(`CSV must have exactly 366 rows, found ${data.length}`);
        return { isValid: false, errors }; // Stop here if row count is wrong
    }

    // Check columns
    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    const missingColumns = expectedColumns.filter(col => !columns.includes(col));
    
    if (missingColumns.length > 0) {
        errors.push(`Missing columns: ${missingColumns.join(', ')}`);
        return { isValid: false, errors }; // Stop here if columns are missing
    }

    // Validate each row
    const dateSet = new Set();
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const dateRegex = /^([1-9]|[12][0-9]|3[01])-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/;

    for (let index = 0; index < data.length; index++) {
        const row = data[index];
        const rowNum = index + 1;

        // Validate date format
        if (!dateRegex.test(row.Date)) {
            errors.push(`Row ${rowNum}: Invalid date format '${row.Date}'. Expected format: D-MMM (e.g., 1-Jan)`);
            return { isValid: false, errors }; // Stop on first error
        }

        // Check for duplicate dates
        if (dateSet.has(row.Date)) {
            errors.push(`Row ${rowNum}: Duplicate date '${row.Date}'`);
            return { isValid: false, errors }; // Stop on first error
        }
        dateSet.add(row.Date);

        // Validate prayer times
        const prayers = ['Fajr', 'Sunrise', 'Zenith', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        for (const prayer of prayers) {
            if (!row[prayer]) {
                errors.push(`Row ${rowNum}: Missing ${prayer} time`);
                return { isValid: false, errors }; // Stop on first error
            } else if (!timeRegex.test(row[prayer])) {
                errors.push(`Row ${rowNum}: Invalid ${prayer} time format '${row[prayer]}'. Expected HH:MM`);
                return { isValid: false, errors }; // Stop on first error
            }
        }

        // Uncomment this section when our csv data is ready for time sequence validation
        // Validate time sequence
        // const times = prayers.map(p => {
        //     const [h, m] = row[p].split(':').map(Number);
        //     return h * 60 + m;
        // });

        // for (let i = 1; i < times.length; i++) {
        //     if (times[i] <= times[i - 1]) {
        //         errors.push(`Row ${rowNum}: ${prayers[i]} time must be after ${prayers[i - 1]}`);
        //         return { isValid: false, errors }; // Stop on first error
        //     }
        // }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Convert CSV data to timings array
const convertCSVToTimings = (csvData) => {
    return csvData.map((row, index) => ({
        date_csv: row.Date,
        dayNumber: index + 1,
        fajr: row.Fajr,
        sunrise: row.Sunrise,
        zenith: row.Zenith,
        dhuhr: row.Dhuhr,
        asr: row.Asr,
        maghrib: row.Maghrib,
        isha: row.Isha
    }));
};

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

// Get official meeqat by ID
const getOfficialMeeqatById = async (id) => {
    try {
        const officialMeeqat = await OfficialMeeqat.findById(id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!officialMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'Official meeqat not found'
            };
        }

        return {
            status: 'success',
            data: officialMeeqat
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
        const existingQuery = { locationName, sect };
        if (sect === 'sunni') {
            existingQuery.schoolOfThought = schoolOfThought;
        }

        const existing = await OfficialMeeqat.findOne(existingQuery);
        if (existing) {
            return {
                status: 'failed',
                code: 409,
                message: `Official meeqat already exists for ${locationName} - ${sect}${sect === 'sunni' ? ' - ' + schoolOfThought : ''}`
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

        // Convert CSV to timings format
        const timings = convertCSVToTimings(csvData);

        // Create new official meeqat
        const newOfficialMeeqat = new OfficialMeeqat({
            locationName,
            sect,
            schoolOfThought: sect === 'sunni' ? schoolOfThought : undefined,
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
const updateOfficialMeeqat = async (id, updateData) => {
    try {
        const { publisher, coordinates, csvBuffer, updatedBy } = updateData;

        // Find existing document
        const existingMeeqat = await OfficialMeeqat.findById(id);
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
            id,
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