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

// Send notification to mosque users (for editors)
const sendToMosqueUsers = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId } = req.user;
    const notificationData = req.body;

    // Validation
    if (!notificationData.title || !notificationData.body) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Title and body are required'
        });
    }

    if (notificationData.title.length > 100) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Title must be 100 characters or less'
        });
    }

    if (notificationData.body.length > 500) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Body must be 500 characters or less'
        });
    }

    // Validate mosqueId format
    if (!mosqueId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Invalid mosque ID format'
        });
    }

    const result = await pushNotificationService.sendToMosqueUsers(mosqueId, notificationData, userId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Schedule notification for later (for editors)
const scheduleNotification = catchError(async (req, res) => {
    const { mosqueId } = req.body;
    const { userId } = req.user;
    const { notificationData, scheduledFor } = req.body;

    // Validation
    if (!notificationData || !notificationData.title || !notificationData.body) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Notification data with title and body is required'
        });
    }

    if (notificationData.title.length > 100) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Title must be 100 characters or less'
        });
    }

    if (notificationData.body.length > 500) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Body must be 500 characters or less'
        });
    }

    if (!scheduledFor) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Scheduled time is required'
        });
    }

    // Validate scheduled time
    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Invalid scheduled time format'
        });
    }

    // Validate mosqueId format
    if (!mosqueId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Invalid mosque ID format'
        });
    }

    const result = await pushNotificationService.scheduleNotification(mosqueId, notificationData, scheduledFor, userId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.status(201).json(result);
});

// Get scheduled notifications for a mosque (for editors)
const getScheduledNotifications = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId } = req.user;
    const { page = 1, limit = 10, status } = req.query;

    const ScheduledNotification = require('../models/scheduledNotification.model');

    const query = { mosque: mosqueId, editor: userId };
    if (status) {
        query.status = status;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
        ScheduledNotification.find(query)
            .populate('mosque', 'name')
            .sort({ scheduledFor: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        ScheduledNotification.countDocuments(query)
    ]);

    return res.json({
        status: 'success',
        data: notifications,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// Cancel scheduled notification (for editors)
const cancelScheduledNotification = catchError(async (req, res) => {
    const { notificationId } = req.params;
    const { userId } = req.user;

    const ScheduledNotification = require('../models/scheduledNotification.model');

    const notification = await ScheduledNotification.findOne({
        _id: notificationId,
        editor: userId,
        status: 'scheduled'
    });

    if (!notification) {
        return res.status(404).json({
            status: 'failed',
            code: 404,
            message: 'Scheduled notification not found or already processed'
        });
    }

    await notification.cancel();

    return res.json({
        status: 'success',
        message: 'Scheduled notification cancelled successfully'
    });
});

module.exports = {
    registerToken,
    unregisterToken,
    sendToUser,
    sendToUsers,
    sendToAll,
    cleanupExpiredTokens,
    getUserTokens,
    sendToMosqueUsers,
    scheduleNotification,
    getScheduledNotifications,
    cancelScheduledNotification
};
