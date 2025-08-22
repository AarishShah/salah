const pushNotificationService = require('../services/pushNotification.service');
const PushToken = require('../models/pushToken.model');
const catchError = require('../utils/catchError');

// Register push token
const registerToken = catchError(async (req, res) => {
    const { userId } = req.user;
    const { expoPushToken, deviceInfo } = req.body;

    if (!expoPushToken) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Expo push token is required'
        });
    }

    const result = await pushNotificationService.registerToken(userId, {
        expoPushToken,
        deviceInfo
    });

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.status(201).json(result);
});

// Unregister push token
const unregisterToken = catchError(async (req, res) => {
    const { expoPushToken } = req.body;

    if (!expoPushToken) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Expo push token is required'
        });
    }

    const result = await pushNotificationService.unregisterToken(expoPushToken);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Send notification to specific user
const sendToUser = catchError(async (req, res) => {
    const { userId } = req.params;
    const notificationData = req.body;

    if (!notificationData.title || !notificationData.body) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Title and body are required'
        });
    }

    const result = await pushNotificationService.sendToUser(userId, notificationData);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Send notification to multiple users
const sendToUsers = catchError(async (req, res) => {
    const { userIds } = req.body;
    const notificationData = req.body;

    if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'User IDs array is required'
        });
    }

    if (!notificationData.title || !notificationData.body) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Title and body are required'
        });
    }

    const result = await pushNotificationService.sendToUsers(userIds, notificationData);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Send notification to all users
const sendToAll = catchError(async (req, res) => {
    const notificationData = req.body;

    if (!notificationData.title || !notificationData.body) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Title and body are required'
        });
    }

    const result = await pushNotificationService.sendToAll(notificationData);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});


// Clean up expired tokens
const cleanupExpiredTokens = catchError(async (req, res) => {
    const result = await pushNotificationService.cleanupExpiredTokens();

    if (result.status === 'failed') {
        return res.status(result.code || 500).json(result);
    }

    return res.json(result);
});

// Get user's push tokens
const getUserTokens = catchError(async (req, res) => {
    const { userId } = req.user;

    const tokens = await PushToken.find({ user: userId, isActive: true });

    return res.json({
        status: 'success',
        data: tokens
    });
});

module.exports = {
    registerToken,
    unregisterToken,
    sendToUser,
    sendToUsers,
    sendToAll,
    cleanupExpiredTokens,
    getUserTokens
};
