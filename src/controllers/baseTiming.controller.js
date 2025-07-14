const baseTimingService = require('../services/baseTiming.service');
const catchError = require('../utils/catchError');
const fs = require('fs');

// POST /api/base-timing/upload
const uploadBaseTiming = catchError(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'failed', message: 'CSV file is required' });
    }
    const { locationName, latitude, longitude } = req.body;
    if (!locationName) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ status: 'failed', message: 'Location name is required' });
    }
    // Parse and validate CSV
    let timings;
    try {
        timings = await baseTimingService.parseAndValidateCSV(req.file.path);
    } catch (err) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ status: 'failed', message: err.message });
    }
    // Save to DB
    const coordinates = (latitude && longitude) ? { latitude: Number(latitude), longitude: Number(longitude) } : undefined;
    const { baseTiming, location } = await baseTimingService.saveBaseTimingAndLocation(timings, locationName, coordinates);
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    return res.status(201).json({ status: 'success', baseTimingId: baseTiming._id, locationId: location._id });
});

module.exports = {
    uploadBaseTiming
}; 