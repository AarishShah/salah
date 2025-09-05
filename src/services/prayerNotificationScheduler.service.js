const cron = require('node-cron');
const User = require('../models/user.model');
const Mosque = require('../models/mosque.model');
const MosqueMeeqat = require('../models/mosqueMeeqat.model');
const { sendPushNotification } = require('./pushNotification.service');

class PrayerNotificationScheduler {
    constructor() {
        this.isRunning = false;
        this.schedulerTask = null;
        this.dailyRefreshTask = null;
        this.prayerTimesCache = new Map(); // Cache for prayer times
    }

    // Start the prayer notification scheduler
    start() {
        if (this.isRunning) {
            console.log('🔄 Prayer notification scheduler is already running');
            return;
        }

        console.log('🚀 Starting prayer notification scheduler...');

        // Schedule prayer notifications every 30 minutes
        this.schedulerTask = cron.schedule('0,30 * * * *', async () => {
            await this.checkAndSendPrayerNotifications();
        }, {
            scheduled: true,
            timezone: 'Asia/Karachi' // Pakistan timezone
        });

        // Schedule daily refresh at 12:01 AM to update prayer times
        this.dailyRefreshTask = cron.schedule('1 0 * * *', async () => {
            await this.refreshPrayerTimesCache();
        }, {
            scheduled: true,
            timezone: 'Asia/Karachi' // Pakistan timezone
        });

        this.isRunning = true;
        console.log('✅ Prayer notification scheduler started successfully');
        console.log('🔄 Daily refresh scheduled for 12:01 AM Pakistan time');
    }

    // Stop the prayer notification scheduler
    stop() {
        if (!this.isRunning) {
            console.log('🔄 Prayer notification scheduler is not running');
            return;
        }

        if (this.schedulerTask) {
            this.schedulerTask.stop();
            this.schedulerTask = null;
        }

        if (this.dailyRefreshTask) {
            this.dailyRefreshTask.stop();
            this.dailyRefreshTask = null;
        }

        this.isRunning = false;
        console.log('🛑 Prayer notification scheduler stopped');
    }

    // Check and send prayer notifications
    async checkAndSendPrayerNotifications() {
        try {
            console.log('🔍 Checking for prayer notifications...');
            
            // Get current time in Pakistan
            const now = new Date();
            const pakistanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Karachi"}));
            const currentHour = pakistanTime.getHours();
            const currentMinute = pakistanTime.getMinutes();
            
            console.log(`⏰ Current time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);

            // Get all users with favorite mosques
            const usersWithFavorites = await User.find({
                'favoritesMosques.0': { $exists: true }
            }).populate('favoritesMosques');

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

            console.log(`👥 Found ${usersWithTokens.length} users with favorite mosques and push tokens`);

            if (usersWithFavorites.length === 0) {
                console.log('📱 No users with favorite mosques and push tokens found');
                return;
            }

            console.log(`👥 Found ${usersWithFavorites.length} users with favorite mosques`);

            // Check each user's favorite mosque for prayer times
            for (const user of usersWithTokens) {
                await this.checkUserPrayerNotifications(user, pakistanTime);
            }

            console.log('✅ Prayer notification check completed');

        } catch (error) {
            console.error('❌ Error in prayer notification scheduler:', error);
        }
    }

    // Check prayer notifications for a specific user
    async checkUserPrayerNotifications(user, currentTime) {
        try {
            const favoriteMosque = user.favoritesMosques[0]; // User can only have one favorite
            
            if (!favoriteMosque) {
                return;
            }

            // Get prayer times from cache or fetch from meeqat
            const prayerTimes = await this.getPrayerTimesForMosque(favoriteMosque._id);
            
            if (!prayerTimes) {
                console.log(`⚠️ No prayer times found for mosque ${favoriteMosque.name}`);
                return;
            }

            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();
            const currentTimeInMinutes = currentHour * 60 + currentMinute;

            // Check each prayer time
            const prayers = [
                { name: 'Fajr', time: prayerTimes.fajr },
                { name: 'Dhuhr', time: prayerTimes.dhuhr },
                { name: 'Asr', time: prayerTimes.asr },
                { name: 'Maghrib', time: prayerTimes.maghrib },
                { name: 'Isha', time: prayerTimes.isha }
            ];

            for (const prayer of prayers) {
                if (!prayer.time) continue;

                // Parse prayer time (format: "HH:MM")
                const [prayerHour, prayerMinute] = prayer.time.split(':').map(Number);
                const prayerTimeInMinutes = prayerHour * 60 + prayerMinute;
                
                // Check if it's 15 minutes before prayer time
                const notificationTime = prayerTimeInMinutes - 15;
                
                if (currentTimeInMinutes >= notificationTime && currentTimeInMinutes < notificationTime + 1) {
                    // Send notification
                    await this.sendPrayerNotification(user, favoriteMosque, prayer);
                }
            }

        } catch (error) {
            console.error(`❌ Error checking prayer notifications for user ${user._id}:`, error);
        }
    }

    // Send prayer notification to user
    async sendPrayerNotification(user, mosque, prayer) {
        try {
            const notificationData = {
                title: `🕌 ${prayer.name} Prayer Reminder`,
                body: `${prayer.name} prayer in 15 minutes at ${mosque.name}`,
                data: {
                    type: 'prayer_reminder',
                    mosqueId: mosque._id.toString(),
                    prayerName: prayer.name,
                    prayerTime: prayer.time,
                    mosqueName: mosque.name
                }
            };

            // Send push notification
            await sendPushNotification(user.pushToken, notificationData);
            
            console.log(`📱 Sent ${prayer.name} prayer notification to user ${user._id} for mosque ${mosque.name}`);

        } catch (error) {
            console.error(`❌ Error sending prayer notification to user ${user._id}:`, error);
        }
    }

    // Manual test function for admin testing
    async testPrayerNotifications() {
        console.log('🧪 Testing prayer notifications...');
        
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

            // Send a test notification
            const testNotification = {
                title: '🧪 Test Prayer Notification',
                body: 'This is a test prayer notification from the scheduler',
                data: {
                    type: 'test_notification',
                    mosqueId: testUser.favoritesMosques[0]._id.toString(),
                    mosqueName: testUser.favoritesMosques[0].name
                }
            };

            await sendPushNotification(pushToken.expoPushToken, testNotification);
            
            console.log('✅ Test prayer notification sent successfully');
            return { 
                success: true, 
                message: 'Test notification sent successfully',
                user: testUser._id,
                mosque: testUser.favoritesMosques[0].name
            };

        } catch (error) {
            console.error('❌ Error in test prayer notifications:', error);
            return { success: false, message: error.message };
        }
    }

    // Get prayer times for a mosque (from cache or fetch from meeqat)
    async getPrayerTimesForMosque(mosqueId) {
        try {
            const mosqueIdStr = mosqueId.toString();
            
            // Check if we have cached prayer times
            if (this.prayerTimesCache.has(mosqueIdStr)) {
                const cached = this.prayerTimesCache.get(mosqueIdStr);
                const now = new Date();
                
                // Check if cache is still valid (less than 24 hours old)
                if (now - cached.timestamp < 24 * 60 * 60 * 1000) {
                    return cached.prayerTimes;
                }
            }
            
            // Fetch fresh prayer times from mosque meeqat
            const prayerTimes = await this.fetchPrayerTimesFromMeeqat(mosqueId);
            
            if (prayerTimes) {
                // Cache the prayer times
                this.prayerTimesCache.set(mosqueIdStr, {
                    prayerTimes,
                    timestamp: new Date()
                });
                
                console.log(`📅 Cached prayer times for mosque ${mosqueIdStr}`);
                return prayerTimes;
            }
            
            return null;
            
        } catch (error) {
            console.error(`❌ Error getting prayer times for mosque ${mosqueId}:`, error);
            return null;
        }
    }

    // Fetch prayer times from mosque meeqat
    async fetchPrayerTimesFromMeeqat(mosqueId) {
        try {
            // Get today's date
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            // Find mosque meeqat for today
            const mosqueMeeqat = await MosqueMeeqat.findOne({
                mosque: mosqueId,
                date: dateStr
            });
            
            if (!mosqueMeeqat) {
                console.log(`⚠️ No meeqat found for mosque ${mosqueId} on ${dateStr}`);
                return null;
            }
            
            // Extract prayer times from meeqat
            const prayerTimes = {
                fajr: mosqueMeeqat.fajr,
                dhuhr: mosqueMeeqat.dhuhr,
                asr: mosqueMeeqat.asr,
                maghrib: mosqueMeeqat.maghrib,
                isha: mosqueMeeqat.isha
            };
            
            console.log(`📅 Fetched prayer times for mosque ${mosqueId} on ${dateStr}:`, prayerTimes);
            return prayerTimes;
            
        } catch (error) {
            console.error(`❌ Error fetching prayer times from meeqat for mosque ${mosqueId}:`, error);
            return null;
        }
    }

    // Refresh prayer times cache daily at 12:01 AM
    async refreshPrayerTimesCache() {
        try {
            console.log('🔄 Starting daily prayer times cache refresh...');
            
            // Get all users with favorite mosques
            const usersWithFavorites = await User.find({
                'favoritesMosques.0': { $exists: true }
            }).populate('favoritesMosques');
            
            const uniqueMosqueIds = new Set();
            usersWithFavorites.forEach(user => {
                if (user.favoritesMosques && user.favoritesMosques.length > 0) {
                    uniqueMosqueIds.add(user.favoritesMosques[0]._id.toString());
                }
            });
            
            console.log(`🔄 Refreshing prayer times for ${uniqueMosqueIds.size} unique mosques...`);
            
            // Refresh prayer times for each unique mosque
            for (const mosqueId of uniqueMosqueIds) {
                try {
                    const prayerTimes = await this.fetchPrayerTimesFromMeeqat(mosqueId);
                    
                    if (prayerTimes) {
                        // Update cache
                        this.prayerTimesCache.set(mosqueId, {
                            prayerTimes,
                            timestamp: new Date()
                        });
                        
                        console.log(`✅ Updated prayer times cache for mosque ${mosqueId}`);
                    } else {
                        console.log(`⚠️ Could not fetch prayer times for mosque ${mosqueId}`);
                    }
                } catch (error) {
                    console.error(`❌ Error refreshing prayer times for mosque ${mosqueId}:`, error);
                }
            }
            
            console.log('✅ Daily prayer times cache refresh completed');
            
        } catch (error) {
            console.error('❌ Error in daily prayer times cache refresh:', error);
        }
    }

    // Get scheduler status
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastCheck: new Date().toISOString(),
            timezone: 'Asia/Karachi',
            cachedMosques: this.prayerTimesCache.size,
            dailyRefreshScheduled: this.dailyRefreshTask !== null
        };
    }
}

// Create singleton instance
const prayerNotificationScheduler = new PrayerNotificationScheduler();

// Export functions for external use
const startPrayerNotificationScheduler = () => {
    prayerNotificationScheduler.start();
    return prayerNotificationScheduler;
};

const stopPrayerNotificationScheduler = () => {
    prayerNotificationScheduler.stop();
};

const testPrayerNotifications = async () => {
    return await prayerNotificationScheduler.testPrayerNotifications();
};

const getSchedulerStatus = () => {
    return prayerNotificationScheduler.getStatus();
};

module.exports = {
    startPrayerNotificationScheduler,
    stopPrayerNotificationScheduler,
    testPrayerNotifications,
    getSchedulerStatus,
    PrayerNotificationScheduler
};
