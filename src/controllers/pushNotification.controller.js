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

// Get user's push tokens
const getUserTokens = catchError(async (req, res) => {
    const { userId } = req.user;

    const tokens = await PushToken.find({ user: userId, isActive: true });

    return res.json({
        status: 'success',
        data: tokens
    });
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


// Get scheduled notifications for a mosque (for editors and admins)
const getScheduledNotifications = catchError(async (req, res) => {
    const { mosqueId } = req.params;
    const { userId, role } = req.user;
    const { page = 1, limit = 10, status } = req.query;

    const ScheduledNotification = require('../models/scheduledNotification.model');

    // Build query based on user role and mosque context
    let query = { editor: userId };
    if (status) {
        query.status = status;
    }

    // For editors: filter by specific mosque
    // For admins: show both single mosque and multi-mosque notifications
    if (role === 'editor') {
        query.mosque = mosqueId;
    } else if (role === 'admin') {
        // Admin can see notifications for specific mosque OR notifications that include this mosque in array
        query.$or = [
            { mosque: mosqueId },
            { mosques: mosqueId }
        ];
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
        ScheduledNotification.find(query)
            .populate('mosque', 'name')
            .populate('mosques', 'name')
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

// Cancel scheduled notification (for editors and admins)
const cancelScheduledNotification = catchError(async (req, res) => {
    const { notificationId } = req.params;
    const { userId } = req.user;

    const ScheduledNotification = require('../models/scheduledNotification.model');

    const notification = await ScheduledNotification.findOne({
        _id: notificationId,
        editor: userId,
        status: 'scheduled'
    }).populate('mosque', 'name').populate('mosques', 'name');

    if (!notification) {
        return res.status(404).json({
            status: 'failed',
            code: 404,
            message: 'Scheduled notification not found or already processed'
        });
    }

    await notification.cancel();

    // Determine notification type for response message
    const isMultiMosque = notification.mosques && notification.mosques.length > 0;
    const targetDescription = isMultiMosque
        ? `${notification.mosques.length} mosques`
        : notification.mosque.name;

    return res.json({
        status: 'success',
        message: `Scheduled notification for ${targetDescription} cancelled successfully`
    });
});

module.exports = {
    registerToken,
    unregisterToken,
    getUserTokens,
    sendToUser,
    sendToUsers,
    sendToAll,
    cleanupExpiredTokens,
    getScheduledNotifications,
    cancelScheduledNotification
};
