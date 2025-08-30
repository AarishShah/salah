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

module.exports = {
    registerToken,
    unregisterToken,
    getUserTokens,
    sendToUser,
    sendToUsers,
    sendToAll,
    cleanupExpiredTokens,
    notifyScheduleUpdate
};
