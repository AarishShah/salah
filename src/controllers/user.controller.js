const userService = require("../services/user.service");
const pushNotificationService = require("../services/pushNotification.service");
const catchError = require("../utils/catchError");
const User = require('../models/user.model');

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

const sendNotification = catchError(async (req, res) => {
    const { userId, role } = req.user;
    const { mosqueId, notificationData } = req.body;

    let result;

    if (role === 'admin') {
        // For admins, send to all mosques they created (mosqueId is optional)
        if (mosqueId) {
            result = await pushNotificationService.sendToMosqueUsers(mosqueId, notificationData, userId);
        } else {
            // Admin wants to send to all their mosques
            result = await pushNotificationService.sendToAdminMosques(notificationData, userId);
        }
    } else {
        // For editors, send to specific mosque (mosqueId is required)
        if (!mosqueId) {
            return res.status(400).json({
                status: 'failed',
                message: 'mosqueId is required for editors'
            });
        }
        result = await pushNotificationService.sendToMosqueUsers(mosqueId, notificationData, userId);
    }

    if (result.status === 'failed') return res.status(result.code || 400).json(result);
    return res.json(result);
})

const scheduleNotification = catchError(async (req, res) => {
    const { userId, role } = req.user;
    const { mosqueId, notificationData, scheduledFor } = req.body;

    let result;

    if (role === 'admin') {
        if (mosqueId) {
            // Admin wants to schedule for specific mosque - verify it's in their mosqueGroup
            const admin = await User.findById(userId).select('mosqueGroup');

            if (!admin || !admin.mosqueGroup.includes(mosqueId)) {
                return res.status(403).json({
                    status: 'failed',
                    message: 'You can only schedule notifications for mosques in your group'
                });
            }

            result = await pushNotificationService.scheduleNotification(mosqueId, notificationData, scheduledFor, userId);
        } else {
            // Admin wants to schedule for all their mosques
            result = await pushNotificationService.scheduleNotificationForAdminMosques(notificationData, scheduledFor, userId);
        }
    } else {
        // For editors, mosqueId is required
        if (!mosqueId) {
            return res.status(400).json({
                status: 'failed',
                message: 'mosqueId is required for editors'
            });
        }

        result = await pushNotificationService.scheduleNotification(mosqueId, notificationData, scheduledFor, userId);
    }

    if (result.status === 'failed') return res.status(result.code || 400).json(result);
    return res.json(result);
})


// Notification preferences
const getNotificationPreferences = catchError(async (req, res) => {
    const { userId } = req.user;
    const result = await userService.getNotificationPreferences(userId);
    if (result.status === 'failed') return res.status(result.code || 400).json(result);
    return res.json(result);
})

const updateNotificationPreferences = catchError(async (req, res) => {
    const { userId } = req.user;
    const updates = req.body;
    const result = await userService.updateNotificationPreferences(userId, updates);
    if (result.status === 'failed') return res.status(result.code || 400).json(result);
    return res.json(result);
});

// Get user's scheduled notifications (for editors and admins)
const getMyScheduledNotifications = catchError(async (req, res) => {
    const { userId, role } = req.user;
    const { page = 1, limit = 10, status } = req.query;

    const User = require('../models/user.model');
    const ScheduledNotification = require('../models/scheduledNotification.model');

    // Build query to get user's scheduled notifications
    let query = { editor: userId };
    if (status) {
        query.status = status;
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

    // Format notifications to show only essential fields
    const formattedNotifications = notifications.map(notification => {
        const isMultiMosque = notification.mosques && notification.mosques.length > 0;
        return {
            _id: notification._id,
            title: notification.title,
            body: notification.body,
            scheduledFor: notification.scheduledFor,
            status: notification.status,
            targetType: isMultiMosque ? 'multiple' : 'single',
            targetMosques: isMultiMosque
                ? notification.mosques.map(m => ({ _id: m._id, name: m.name }))
                : [{ _id: notification.mosque._id, name: notification.mosque.name }],
            mosquesCount: isMultiMosque ? notification.mosques.length : 1
        };
    });

    return res.json({
        status: 'success',
        data: formattedNotifications,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// Cancel scheduled notification by ID (for editors and admins)
const cancelMyScheduledNotification = catchError(async (req, res) => {
    const { notificationId } = req.params;
    const { userId } = req.user;

    const ScheduledNotification = require('../models/scheduledNotification.model');
    const User = require('../models/user.model');

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

    // Cancel the notification
    await notification.cancel();

    // Remove reference from user's scheduledNotifications array
    await User.findByIdAndUpdate(userId, {
        $pull: { scheduledNotifications: notificationId }
    });

    // Determine notification type for response message
    const isMultiMosque = notification.mosques && notification.mosques.length > 0;
    const targetDescription = isMultiMosque
        ? `${notification.mosques.length} mosques (${notification.mosques.map(m => m.name).join(', ')})`
        : notification.mosque.name;

    return res.json({
        status: 'success',
        message: `Scheduled notification for ${targetDescription} cancelled successfully`,
        data: {
            notificationId,
            title: notification.title,
            targetType: isMultiMosque ? 'multiple' : 'single',
            targetDescription
        }
    });
});



module.exports = {
    getProfile,
    updateProfile,
    deleteAccount,
    createEditorRequest,
    createEditorAdditionalRequest,
    getEditorRequestStatus,
    verifyPhoneStatus,
    sendNotification,
    scheduleNotification,
    getNotificationPreferences,
    updateNotificationPreferences,
    getMyScheduledNotifications,
    cancelMyScheduledNotification
};