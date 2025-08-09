const mosqueMeeqatService = require("../services/mosqueMeeqat.service");
const catchError = require("../utils/catchError");

// Get mosque meeqat with date range and format options
const getMosqueMeeqat = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { startDate, endDate, timeFormat = '12h' } = req.query;

    const result = await mosqueMeeqatService.getMosqueMeeqat(
        mosqueId, 
        { startDate, endDate, timeFormat }
    );

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

// Download HTML file
const downloadMeeqatHTML = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { startDate, endDate, timeFormat = '12h' } = req.query;

    const result = await mosqueMeeqatService.generateMeeqatHTML(
        mosqueId,
        { startDate, endDate, timeFormat }
    );

    if (result.status === 'failed') {
        return res.status(result.code || 404).send(`
            <html>
                <head><title>Error</title></head>
                <body>
                    <h1>Error - ${result.code}</h1>
                    <p>${result.message}</p>
                </body>
            </html>
        `);
    }

    // Set headers for file download
    const filename = result.filename || 'mosque-meeqat.html';
    res.set({
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
    });

    return res.send(result.html);
});

// Generate new mosque meeqat
const generateMosqueMeeqat = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId } = req.user;

    const result = await mosqueMeeqatService.generateMosqueMeeqat(mosqueId, userId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.status(201).json(result);
});

// Approve mosque meeqat
const approveMosqueMeeqat = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId } = req.user;

    const result = await mosqueMeeqatService.approveMosqueMeeqat(mosqueId, userId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Update mosque meeqat (day-specific or bulk updates)
const updateMosqueMeeqat = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId } = req.user;
    const updateData = req.body;

    const result = await mosqueMeeqatService.updateMosqueMeeqat(
        mosqueId, 
        updateData, 
        userId
    );

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Permanently delete mosque meeqat
const deleteMosqueMeeqat = catchError(async (req, res) => {
    const { mosqueId } = req.params;

    const result = await mosqueMeeqatService.deleteMosqueMeeqat(mosqueId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

module.exports = {
    getMosqueMeeqat,
    downloadMeeqatHTML,
    generateMosqueMeeqat,
    approveMosqueMeeqat,
    updateMosqueMeeqat,
    deleteMosqueMeeqat
};