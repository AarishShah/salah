const ScheduledNotification = require('../models/scheduledNotification.model');
const pushNotificationService = require('./pushNotification.service');
const cron = require('node-cron');

// Process scheduled notifications
async function processScheduledNotifications() {
    try {
        console.log('Processing scheduled notifications...');

        // Find notifications that are ready to send
        const readyNotifications = await ScheduledNotification.find({
            status: 'scheduled',
            scheduledFor: { $lte: new Date() }
        }).populate('mosque', 'name');

        console.log(`Found ${readyNotifications.length} notifications ready to send`);

        for (const notification of readyNotifications) {
            try {
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
                    await notification.markAsSent(result.results);
                    console.log(`Notification sent successfully: ${notification.title}`);
                } else {
                    // Mark as failed
                    await notification.markAsFailed(result.message);
                    console.error(`Failed to send notification: ${notification.title} - ${result.message}`);
                }

            } catch (error) {
                console.error(`Error processing notification ${notification._id}:`, error);
                await notification.markAsFailed(error.message);
            }
        }

        console.log('Scheduled notifications processing completed');

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
    console.log('Starting scheduled notification scheduler...');

    // Process scheduled notifications every minute
    cron.schedule('* * * * *', async () => {
        await processScheduledNotifications();
    }, { timezone: 'UTC' });

    // Clean up old notifications daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
        await cleanupOldNotifications();
    }, { timezone: 'UTC' });

    console.log('Scheduled notification scheduler started');
}

module.exports = { start };

