const ScheduledNotification = require('../models/scheduledNotification.model');
const pushNotificationService = require('./pushNotification.service');
const cron = require('node-cron');

// Process scheduled notifications
async function processScheduledNotifications() {
    try {

        // Find notifications that are ready to send
        const readyNotifications = await ScheduledNotification.find({
            status: 'scheduled',
            scheduledFor: { $lte: new Date() }
        }).populate('mosque', 'name').populate('mosques', 'name');

        console.log(`Found ${readyNotifications.length} notifications ready to send`);

        for (const notification of readyNotifications) {
            try {
                // Determine if this is a single mosque or multi-mosque notification
                const isMultiMosque = notification.mosques && notification.mosques.length > 0;

                if (isMultiMosque) {
                    // Handle multi-mosque notification (admin notification)
                    const mosqueNames = notification.mosques.map(m => m.name).join(', ');
                    console.log(`Processing admin notification: ${notification.title} for mosques: ${mosqueNames}`);

                    // Prepare notification data
                    const notificationData = {
                        title: notification.title,
                        body: notification.body,
                        data: notification.data,
                        sound: notification.sound,
                        priority: notification.priority
                    };

                    // Send notification to all admin mosques
                    const result = await pushNotificationService.sendToAdminMosques(
                        notificationData,
                        notification.editor
                    );

                    if (result.status === 'success') {
                        // Mark as sent with results
                        await notification.markAsSent(result.data);
                        console.log(`Admin notification sent successfully: ${notification.title} to ${notification.mosques.length} mosques`);
                    } else {
                        // Mark as failed
                        await notification.markAsFailed(result.message);
                        console.error(`Failed to send admin notification: ${notification.title} - ${result.message}`);
                    }
                } else {
                    // Handle single mosque notification (editor notification)
                    console.log(`Processing notification: ${notification.title} for mosque: ${notification.mosque.name}`);

                    // Prepare notification data
                    const notificationData = {
                        title: notification.title,
                        body: notification.body,
                        data: notification.data,
                        sound: notification.sound,
                        priority: notification.priority
                    };

                    // Send notification to mosque users
                    const result = await pushNotificationService.sendToMosqueUsers(
                        notification.mosque._id,
                        notificationData,
                        notification.editor
                    );

                    if (result.status === 'success') {
                        // Mark as sent with results
                        await notification.markAsSent(result.data);
                        console.log(`Notification sent successfully: ${notification.title}`);
                    } else {
                        // Mark as failed
                        await notification.markAsFailed(result.message);
                        console.error(`Failed to send notification: ${notification.title} - ${result.message}`);
                    }
                }

            } catch (error) {
                console.error(`Error processing notification ${notification._id}:`, error);
                await notification.markAsFailed(error.message);
            }
        }

    } catch (error) {
        console.error('Error in processScheduledNotifications:', error);
    }
}

// Clean up old notifications (older than 30 days)
async function cleanupOldNotifications() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await ScheduledNotification.deleteMany({
            status: { $in: ['sent', 'failed', 'cancelled'] },
            createdAt: { $lt: thirtyDaysAgo }
        });

        console.log(`Cleaned up ${result.deletedCount} old notifications`);

    } catch (error) {
        console.error('Error cleaning up old notifications:', error);
    }
}

// Start the scheduler
function start() {
    const timezone = process.env.TIMEZONE || 'UTC';

    // Process scheduled notifications every minute
    cron.schedule('* * * * *', async () => {
        await processScheduledNotifications();
    }, { timezone });

    // Clean up old notifications daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
        await cleanupOldNotifications();
    }, { timezone });

}

module.exports = { start };

