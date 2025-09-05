const cron = require('node-cron');
const User = require('../models/user.model');
const Mosque = require('../models/mosque.model');
const MosqueSpecialEvent = require('../models/mosqueSpecialEvent.model');
const { sendPushNotification } = require('./pushNotification.service');

class MosqueEventNotificationService {
    constructor() {
        this.isRunning = false;
        this.schedulerTask = null;
    }

    // Start the mosque event notification scheduler
    start() {
        if (this.isRunning) {
            console.log('🔄 Mosque event notification scheduler is already running');
            return;
        }

        console.log('🚀 Starting mosque event notification scheduler...');

        // Schedule event notifications to run daily at 9:00 AM
        this.schedulerTask = cron.schedule('0 9 * * *', async () => {
            await this.checkAndSendEventNotifications();
        }, {
            scheduled: true,
            timezone: 'Asia/Karachi' // Pakistan timezone
        });

        this.isRunning = true;
        console.log('✅ Mosque event notification scheduler started successfully');
    }

    // Stop the mosque event notification scheduler
    stop() {
        if (!this.isRunning) {
            console.log('🔄 Mosque event notification scheduler is not running');
            return;
        }

        if (this.schedulerTask) {
            this.schedulerTask.stop();
            this.schedulerTask = null;
        }

        this.isRunning = false;
        console.log('🛑 Mosque event notification scheduler stopped');
    }

    // Check and send event notifications
    async checkAndSendEventNotifications() {
        try {
            console.log('🔍 Checking for mosque event notifications...');
            
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            console.log(`📅 Checking events for: ${today.toDateString()} and ${tomorrow.toDateString()}`);

            // Get all users with favorite mosques
            const usersWithFavorites = await User.find({
                'favoritesMosques.0': { $exists: true }
            }).populate('favoritesMosques');

            if (usersWithFavorites.length === 0) {
                console.log('📱 No users with favorite mosques found');
                return;
            }

            console.log(`👥 Found ${usersWithFavorites.length} users with favorite mosques`);

            // Get push tokens for these users
            const PushToken = require('../models/pushToken.model');
            const usersWithTokens = [];
            
            for (const user of usersWithFavorites) {
                const pushToken = await PushToken.findOne({ 
                    user: user._id, 
                    isActive: true 
                });
                
                if (pushToken) {
                    usersWithTokens.push({
                        ...user.toObject(),
                        pushToken: pushToken.expoPushToken
                    });
                }
            }

            if (usersWithTokens.length === 0) {
                console.log('📱 No users with active push tokens found');
                return;
            }

            console.log(`📱 Found ${usersWithTokens.length} users with push tokens`);

            // Check each user's favorite mosque for upcoming events
            for (const user of usersWithTokens) {
                await this.checkUserEventNotifications(user, today, tomorrow);
            }

            console.log('✅ Mosque event notification check completed');

        } catch (error) {
            console.error('❌ Error in mosque event notification scheduler:', error);
        }
    }

    // Check event notifications for a specific user
    async checkUserEventNotifications(user, today, tomorrow) {
        try {
            const favoriteMosque = user.favoritesMosques[0]; // User can only have one favorite
            
            if (!favoriteMosque) {
                return;
            }

            // Get current year
            const currentYear = today.getFullYear();
            
            // Get special events for this mosque and year
            const specialEvents = await MosqueSpecialEvent.findOne({
                mosque: favoriteMosque._id,
                year: currentYear
            });

            if (!specialEvents || !specialEvents.events || specialEvents.events.length === 0) {
                return;
            }

            // Check for events happening today or tomorrow
            for (const event of specialEvents.events) {
                const eventDate = new Date(event.date);
                
                // Check if event is today or tomorrow
                if (this.isSameDay(eventDate, today) || this.isSameDay(eventDate, tomorrow)) {
                    await this.sendEventNotification(user, favoriteMosque, event, eventDate);
                }
            }

        } catch (error) {
            console.error(`❌ Error checking event notifications for user ${user._id}:`, error);
        }
    }

    // Send event notification to user
    async sendEventNotification(user, mosque, event, eventDate) {
        try {
            const isToday = this.isSameDay(eventDate, new Date());
            const dayText = isToday ? 'today' : 'tomorrow';
            
            const eventName = event.eventType === 'custom' ? event.customEventName : event.eventType;
            
            const notificationData = {
                title: `🕌 Special Event ${dayText.charAt(0).toUpperCase() + dayText.slice(1)}`,
                body: `${eventName} at ${mosque.name} ${dayText}`,
                data: {
                    type: 'mosque_event',
                    mosqueId: mosque._id.toString(),
                    mosqueName: mosque.name,
                    eventType: event.eventType,
                    eventName: eventName,
                    eventDate: eventDate.toISOString(),
                    isToday: isToday
                }
            };

            // Send push notification
            await sendPushNotification(user.pushToken, notificationData);
            
            console.log(`📱 Sent ${eventName} event notification to user ${user._id} for mosque ${mosque.name}`);

        } catch (error) {
            console.error(`❌ Error sending event notification to user ${user._id}:`, error);
        }
    }

    // Helper function to check if two dates are the same day
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    // Manual test function for admin testing
    async testEventNotifications() {
        console.log('🧪 Testing mosque event notifications...');
        
        try {
            // Get a test user with favorite mosque
            const testUser = await User.findOne({
                'favoritesMosques.0': { $exists: true }
            }).populate('favoritesMosques');

            if (!testUser) {
                console.log('❌ No test user found with favorite mosque');
                return { success: false, message: 'No test user found' };
            }

            // Get push token for this user
            const PushToken = require('../models/pushToken.model');
            const pushToken = await PushToken.findOne({ 
                user: testUser._id, 
                isActive: true 
            });

            if (!pushToken) {
                console.log('❌ No active push token found for test user');
                return { success: false, message: 'No active push token found' };
            }

            // Send a test event notification
            const testNotification = {
                title: '🧪 Test Mosque Event Notification',
                body: 'This is a test mosque event notification',
                data: {
                    type: 'test_mosque_event',
                    mosqueId: testUser.favoritesMosques[0]._id.toString(),
                    mosqueName: testUser.favoritesMosques[0].name,
                    eventType: 'test',
                    eventName: 'Test Event'
                }
            };

            await sendPushNotification(pushToken.expoPushToken, testNotification);
            
            console.log('✅ Test mosque event notification sent successfully');
            return { 
                success: true, 
                message: 'Test mosque event notification sent successfully',
                user: testUser._id,
                mosque: testUser.favoritesMosques[0].name
            };

        } catch (error) {
            console.error('❌ Error in test mosque event notifications:', error);
            return { success: false, message: error.message };
        }
    }

    // Get scheduler status
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastCheck: new Date().toISOString(),
            timezone: 'Asia/Karachi'
        };
    }
}

// Create singleton instance
const mosqueEventNotificationService = new MosqueEventNotificationService();

// Export functions for external use
const startMosqueEventNotificationScheduler = () => {
    mosqueEventNotificationService.start();
    return mosqueEventNotificationService;
};

const stopMosqueEventNotificationScheduler = () => {
    mosqueEventNotificationService.stop();
};

const testMosqueEventNotifications = async () => {
    return await mosqueEventNotificationService.testEventNotifications();
};

const getMosqueEventSchedulerStatus = () => {
    return mosqueEventNotificationService.getStatus();
};

module.exports = {
    startMosqueEventNotificationScheduler,
    stopMosqueEventNotificationScheduler,
    testMosqueEventNotifications,
    getMosqueEventSchedulerStatus,
    MosqueEventNotificationService
};
