const userService = require("../services/user.service");
const catchError = require("../utils/catchError");

// User Controllers
const getProfile = catchError(async (req, res) => {
    const { userId } = req.user;

    const result = await userService.getProfile(userId);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

const updateProfile = catchError(async (req, res) => {
    const { userId } = req.user;
    const updates = req.body;

    const result = await userService.updateProfile(userId, updates);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

const deleteAccount = catchError(async (req, res) => {
    const { userId } = req.user;
    // const { password } = req.body; // For extra confirmation if needed

    const result = await userService.deleteAccount(userId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

const createEditorRequest = catchError(async (req, res) => {
    const { userId } = req.user;
    const { mosqueIds, reason } = req.body;

    if (!mosqueIds || !Array.isArray(mosqueIds) || mosqueIds.length === 0) {
        return res.status(400).json({
            status: 'failed',
            message: 'Please select at least one mosque'
        });
    }

    const result = await userService.createEditorRequest(userId, mosqueIds, reason);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

const createEditorAdditionalRequest = catchError(async (req, res) => {
    const { userId } = req.user;
    const { mosqueIds, reason } = req.body;

    // Validate that user is an editor
    if (req.user.role !== 'editor') {
        return res.status(403).json({
            status: 'failed',
            message: 'Only editors can request additional mosques'
        });
    }

    if (!mosqueIds || !Array.isArray(mosqueIds) || mosqueIds.length === 0) {
        return res.status(400).json({
            status: 'failed',
            message: 'Please select at least one mosque'
        });
    }

    if (!reason || !reason.trim()) {
        return res.status(400).json({
            status: 'failed',
            message: 'Please provide a reason for your request'
        });
    }

    const result = await userService.createEditorAdditionalRequest(userId, mosqueIds, reason);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

const getEditorRequestStatus = catchError(async (req, res) => {
    const { userId } = req.user;

    const result = await userService.getEditorRequestStatus(userId);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

// Need to know phone verfication status
const verifyPhoneStatus = catchError(async (req, res) => {
    const { userId } = req.user;

    const result = await userService.verifyPhoneStatus(userId);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

module.exports = {
    getProfile,
    updateProfile,
    deleteAccount,
    createEditorRequest,
    createEditorAdditionalRequest,
    getEditorRequestStatus,
    verifyPhoneStatus,
};