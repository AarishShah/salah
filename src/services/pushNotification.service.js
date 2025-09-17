const { Expo } = require('expo-server-sdk');
const PushToken = require('../models/pushToken.model');
const mosqueModel = require('../models/mosque.model');

// Initialize Expo SDK
const expo = new Expo();

// Push Notification Services
const registerToken = async (userId, tokenData) => {
    try {
        const { expoPushToken, deviceInfo } = tokenData;

        // Validate Expo push token
        if (!Expo.isExpoPushToken(expoPushToken)) {
            return {
                status: 'failed',
                code: 400,
                message: 'Invalid Expo push token format'
            };
        }

        // Check if token already exists
        let existingToken = await PushToken.findOne({ expoPushToken });

        if (existingToken) {
            // Update existing token
            existingToken.user = userId;
            existingToken.deviceInfo = deviceInfo;
            existingToken.isActive = true;
            existingToken.lastUsedAt = new Date();

            await existingToken.save();

            return {
                status: 'success',
                message: 'Push token updated successfully',
                token: existingToken
            };
        }

        // Create new token
        const newToken = new PushToken({
            user: userId,
            expoPushToken,
            deviceInfo
        });

        await newToken.save();

        return {
            status: 'success',
            message: 'Push token registered successfully',
            token: newToken
        };

    } catch (error) {
        console.error('RegisterToken error:', error);

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
            message: 'Failed to register push token'
        };
    }
};

const unregisterToken = async (expoPushToken) => {
    try {
        const token = await PushToken.findOne({ expoPushToken });

        if (!token) {
            return {
                status: 'failed',
                code: 404,
                message: 'Push token not found'
            };
        }

        await token.deactivate();

        return {
            status: 'success',
            message: 'Push token unregistered successfully'
        };

    } catch (error) {
        console.error('UnregisterToken error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to unregister push token'
        };
    }
};

const getUserTokens = async (userId) => {
    try {
        const tokens = await PushToken.find({ user: userId, isActive: true })
            .populate('user', 'name email role');

        return {
            status: 'success',
            data: tokens
        };

    } catch (error) {
        console.error('GetUserTokens error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch user tokens'
        };
    }
};

const sendToUser = async (userId, notificationData) => {
    try {
        const tokens = await PushToken.findActiveTokens(userId);

        if (tokens.length === 0) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active push tokens found for user'
            };
        }

        const results = await sendToTokens(tokens, notificationData);

        return {
            status: 'success',
            message: 'Notifications sent successfully',
            results
        };

    } catch (error) {
        console.error('SendToUser error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to send notification to user'
        };
    }
};

const sendToUsers = async (userIds, notificationData) => {
    try {
        // Validate user IDs
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return {
                status: 'failed',
                code: 400,
                message: 'Valid user IDs array is required'
            };
        }

        const tokens = await PushToken.find({
            user: { $in: userIds },
            isActive: true
        }).populate('user', 'name email role');

        if (tokens.length === 0) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active push tokens found for specified users'
            };
        }

        const results = await sendToTokens(tokens, notificationData);

        return {
            status: 'success',
            message: 'Notifications sent successfully',
            results
        };

    } catch (error) {
        console.error('SendToUsers error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to send notifications to users'
        };
    }
};

const sendToAll = async (notificationData) => {
    try {
        const tokens = await PushToken.find({ isActive: true })
            .populate('user', 'name email role');

        if (tokens.length === 0) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active push tokens found'
            };
        }

        const results = await sendToTokens(tokens, notificationData);

        return {
            status: 'success',
            message: 'Notifications sent successfully',
            results
        };

    } catch (error) {
        console.error('SendToAll error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to send notifications to all users'
        };
    }
};


const cleanupExpiredTokens = async () => {
    try {
        // Find tokens that haven't been used in 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const expiredTokens = await PushToken.find({
            lastUsedAt: { $lt: thirtyDaysAgo },
            isActive: true
        });

        if (expiredTokens.length === 0) {
            return {
                status: 'success',
                message: 'No expired tokens found',
                cleaned: 0
            };
        }

        // Deactivate expired tokens
        await PushToken.updateMany(
            { _id: { $in: expiredTokens.map(t => t._id) } },
            { isActive: false }
        );

        return {
            status: 'success',
            message: 'Expired tokens cleaned up successfully',
            cleaned: expiredTokens.length
        };

    } catch (error) {
        console.error('CleanupExpiredTokens error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to cleanup expired tokens'
        };
    }
};

// Helper function to send notifications to tokens
const sendToTokens = async (tokens, notificationData) => {
    const {
        title,
        body,
        data = {},
        sound = 'default',
        priority = 'normal'
    } = notificationData;

    const messages = [];

    // Prepare messages
    for (const token of tokens) {
        const message = {
            to: token.expoPushToken,
            sound,
            title,
            body,
            data: {
                ...data,
                userId: token.user._id.toString()
            },
            priority
        };

        messages.push(message);
    }

    if (messages.length === 0) {
        return {
            sent: 0,
            failed: 0,
            skipped: tokens.length
        };
    }

    // Send notifications in chunks (Expo recommends max 100 per request)
    const chunks = expo.chunkPushNotifications(messages);
    const results = {
        sent: 0,
        failed: 0,
        skipped: tokens.length - messages.length
    };

    // Send chunks
    for (const chunk of chunks) {
        try {
            const chunkResults = await expo.sendPushNotificationsAsync(chunk);

            // Process results
            for (const result of chunkResults) {
                if (result.status === 'ok') {
                    results.sent++;
                } else {
                    results.failed++;
                }
            }

        } catch (error) {
            console.error('Chunk send error:', error);
            results.failed += chunk.length;
        }
    }

    return results;
};


const notifyScheduleUpdate = async (mosqueId, data) => {
    try {


        // Get mosque details for notification
        const mosque = await mosqueModel.findById(mosqueId).select('name favoritedBy');

        if (!mosque) {
            console.log('Mosque not found');
            return {
                status: 'failed',
                message: 'Mosque not found'
            };
        }

        const mosqueName = mosque.name || 'Unknown Mosque';
        const favoritedBy = mosque.favoritedBy || [];

        // Create notification content based on event type
        let title, body;
        const eventType = data.eventType || 'updated';

        switch (eventType) {
            case 'generated':
                title = '🕌 New Schedule Available';
                body = `Prayer schedule generated for ${mosqueName}`;
                break;
            case 'updated':
                title = '🔄 Schedule Updated';
                body = `Prayer times updated for ${mosqueName}`;
                break;
            case 'deleted':
                title = '🗑️ Schedule Removed';
                body = `Prayer schedule removed for ${mosqueName}`;
                break;
            default:
                title = '📅 Schedule Notification';
                body = `Schedule changes for ${mosqueName}`;
        }

        const notificationData = {
            title,
            body,
            data: {
                type: 'SCHEDULE_UPDATE',
                mosqueId,
                mosqueName,
                timestamp: new Date().toISOString(),
                ...data
            }
        };

        if (favoritedBy.length === 0) {
            console.log('No users have favorited this mosque');
            return {
                status: 'success',
                message: 'No users to notify',
                notificationsSent: 0
            };
        }

        const result = await sendToUsers(favoritedBy, notificationData);

        return {
            status: 'success',
            message: `Schedule notifications sent to ${favoritedBy.length} users`,
            notificationsSent: favoritedBy.length,
            details: result
        };

    } catch (error) {
        console.error('NotifyScheduleUpdate error:', error);
        return {
            status: 'failed',
            message: 'Failed to send schedule update notifications',
            error: error.message
        };
    }
};

// Send notification to mosque users (for editors and admins)
const sendToMosqueUsers = async (mosqueId, notificationData, senderId) => {
    try {
        // Get mosque with favorited users
        const mosque = await mosqueModel.findById(mosqueId)
            .populate({
                path: 'favoritedBy',
                select: 'notificationPreferences',
                match: {
                    'notificationPreferences.enabled': true
                }
            });

        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        const users = mosque.favoritedBy.map(u => u._id);
        if (users.length === 0) {
            return {
                status: 'success',
                message: 'No users to notify for this mosque',
                data: { sent: 0, failed: 0, skipped: 0 }
            };
        }

        // Add mosque context to notification data
        const enhancedNotificationData = {
            ...notificationData,
            data: {
                ...notificationData.data,
                type: 'MOSQUE_ANNOUNCEMENT',
                mosqueId: mosqueId.toString(),
                mosqueName: mosque.name,
                sentBy: senderId
            }
        };

        const result = await sendToUsers(users, enhancedNotificationData);
        return result;

    } catch (error) {
        console.error('SendToMosqueUsers error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to send notification to mosque users'
        };
    }
};

// Send notification to all mosques created by admin
const sendToAdminMosques = async (notificationData, adminId) => {
    try {
        // Get admin user to access mosqueGroup
        const User = require('../models/user.model');
        const admin = await User.findById(adminId).select('mosqueGroup');

        if (!admin || !admin.mosqueGroup || admin.mosqueGroup.length === 0) {
            return {
                status: 'success',
                message: 'No mosques found for this admin',
                data: { sent: 0, failed: 0, skipped: 0, mosquesCount: 0 }
            };
        }

        // Get all mosques in admin's mosqueGroup
        const mosques = await mosqueModel.find({
            _id: { $in: admin.mosqueGroup },
            isActive: true
        }).populate({
            path: 'favoritedBy',
            select: 'notificationPreferences',
            match: {
                'notificationPreferences.enabled': true
            }
        });

        if (mosques.length === 0) {
            return {
                status: 'success',
                message: 'No mosques found for this admin',
                data: { sent: 0, failed: 0, skipped: 0, mosquesCount: 0 }
            };
        }

        let totalResults = { sent: 0, failed: 0, skipped: 0 };
        let notifiedMosquesCount = 0;

        // Send notifications for each mosque
        for (const mosque of mosques) {
            console.log("mosque", mosque);
            const users = mosque.favoritedBy.map(u => u._id);
            console.log("users", users);
            if (users.length === 0) {
                continue; // Skip mosques with no users
            }

            // Add mosque context to notification data
            const enhancedNotificationData = {
                ...notificationData,
                data: {
                    ...notificationData.data,
                    type: 'MOSQUE_ANNOUNCEMENT',
                    mosqueId: mosque._id.toString(),
                    mosqueName: mosque.name,
                    sentBy: adminId
                }
            };

            const result = await sendToUsers(users, enhancedNotificationData);

            if (result.status === 'success' && result.results) {
                totalResults.sent += result.results.sent;
                totalResults.failed += result.results.failed;
                totalResults.skipped += result.results.skipped;
                notifiedMosquesCount++;
            }
        }

        return {
            status: 'success',
            message: `Notifications sent to users of ${notifiedMosquesCount} mosque(s)`,
            data: {
                ...totalResults,
                mosquesCount: notifiedMosquesCount,
                totalMosquesFound: mosques.length
            }
        };

    } catch (error) {
        console.error('SendToAdminMosques error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to send notifications to admin mosques'
        };
    }
};

// Schedule notification for all mosques in admin's mosqueGroup
const scheduleNotificationForAdminMosques = async (notificationData, scheduledFor, adminId) => {
    try {
        // Get admin user to access mosqueGroup
        const User = require('../models/user.model');
        const admin = await User.findById(adminId).select('mosqueGroup');

        if (!admin || !admin.mosqueGroup || admin.mosqueGroup.length === 0) {
            return {
                status: 'success',
                message: 'No mosques found for this admin',
                data: { scheduled: 0, mosquesCount: 0 }
            };
        }

        // Validate scheduled time
        const scheduledDate = new Date(scheduledFor);
        const now = new Date();

        if (scheduledDate <= now) {
            return {
                status: 'failed',
                code: 400,
                message: 'Scheduled time must be in the future'
            };
        }

        // Get all active mosques in admin's mosqueGroup
        const mosques = await mosqueModel.find({
            _id: { $in: admin.mosqueGroup },
            isActive: true
        }).populate({
            path: 'favoritedBy',
            select: 'notificationPreferences',
            match: {
                'notificationPreferences.enabled': true
            }
        });

        if (mosques.length === 0) {
            return {
                status: 'success',
                message: 'No active mosques found for this admin',
                data: { scheduled: 0, mosquesCount: 0 }
            };
        }

        const ScheduledNotification = require('../models/scheduledNotification.model');

        // Create single scheduled notification for all mosques (optimized approach)
        const scheduledNotif = new ScheduledNotification({
            mosques: mosques.map(mosque => mosque._id),
            editor: adminId,
            title: notificationData.title,
            body: notificationData.body,
            data: {
                ...notificationData.data,
                type: 'MOSQUE_ANNOUNCEMENT',
                mosquesCount: mosques.length,
                mosqueNames: mosques.map(mosque => mosque.name)
            },
            sound: notificationData.sound || 'default',
            priority: notificationData.priority || 'normal',
            scheduledFor: scheduledDate,
            status: 'scheduled'
        });

        await scheduledNotif.save();

        // Add reference to user's scheduledNotifications array for easier access
        await User.findByIdAndUpdate(adminId, {
            $push: { scheduledNotifications: scheduledNotif._id }
        });

        const scheduledCount = mosques.length;

        return {
            status: 'success',
            message: `Notifications scheduled for ${scheduledCount} mosque(s)`,
            data: {
                scheduled: scheduledCount,
                mosquesCount: mosques.length,
                scheduledFor: scheduledDate
            }
        };

    } catch (error) {
        console.error('ScheduleNotificationForAdminMosques error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to schedule notifications for admin mosques'
        };
    }
};

// Schedule notification for later (for editors and admins)
const scheduleNotification = async (mosqueId, notificationData, scheduledFor, senderId) => {
    try {
        // Validate scheduled time
        const scheduledDate = new Date(scheduledFor);
        const now = new Date();

        if (scheduledDate <= now) {
            return {
                status: 'failed',
                code: 400,
                message: 'Scheduled time must be in the future'
            };
        }

        // Get mosque to validate it exists
        const mosque = await mosqueModel.findById(mosqueId).populate({
            path: 'favoritedBy',
            select: 'notificationPreferences',
            match: {
                'notificationPreferences.enabled': true
            }
        });
        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        // Create scheduled notification record
        const ScheduledNotification = require('../models/scheduledNotification.model');
        const scheduledNotif = new ScheduledNotification({
            mosque: mosqueId,
            editor: senderId,
            title: notificationData.title,
            body: notificationData.body,
            data: {
                ...notificationData.data,
                type: 'MOSQUE_ANNOUNCEMENT',
                mosqueId: mosqueId.toString(),
                mosqueName: mosque.name,
                sentBy: senderId
            },
            sound: notificationData.sound || 'default',
            priority: notificationData.priority || 'normal',
            scheduledFor: scheduledDate,
            status: 'scheduled'
        });

        await scheduledNotif.save();

        // Add reference to user's scheduledNotifications array for easier access
        const User = require('../models/user.model');
        await User.findByIdAndUpdate(senderId, {
            $push: { scheduledNotifications: scheduledNotif._id }
        });

        return {
            status: 'success',
            message: 'Notification scheduled successfully',
            data: {
                scheduledNotificationId: scheduledNotif._id,
                scheduledFor: scheduledDate,
                mosqueName: mosque.name
            }
        };

    } catch (error) {
        console.error('ScheduleNotification error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to schedule notification'
        };
    }
};

module.exports = {
    registerToken,
    unregisterToken,
    getUserTokens,
    sendToUser,
    sendToUsers,
    sendToAll,
    cleanupExpiredTokens,
    notifyScheduleUpdate,
    sendToMosqueUsers,
    sendToAdminMosques,
    scheduleNotification,
    scheduleNotificationForAdminMosques
};
