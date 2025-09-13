const Mosque = require('../models/mosque.model');
const pushNotificationService = require('./pushNotification.service');
const cron = require('node-cron');

function getStartAndEndOfToday() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
}

function getCurrentYear() {
    return new Date().getFullYear();
}

async function runSpecialEventsNotificationOnce() {
    try {
        const { start, end } = getStartAndEndOfToday();

        const mosques = await Mosque.find({
            mosqueSpecialEvents: { $exists: true, $ne: [] },
            favoritedBy: { $exists: true, $ne: [] }
        })
            .populate({
                path: 'favoritedBy',
                select: 'notificationPreferences',
                match: {
                    'notificationPreferences.enabled': true,
                    'notificationPreferences.preferences.specialEvents': true
                }
            })
            .populate({
                path: 'mosqueSpecialEvents',
                match: {
                    'year': getCurrentYear(),
                    'events.date': { $gte: start, $lte: end }
                }
            })
            .select('name favoritedBy mosqueSpecialEvents');

        const filteredMosques = mosques.filter(m =>
            Array.isArray(m.favoritedBy) && m.favoritedBy.length > 0
            && Array.isArray(m.mosqueSpecialEvents) && m.mosqueSpecialEvents.length > 0
        );

        for (const mosque of filteredMosques) {
            const users = mosque.favoritedBy.map(u => u._id);
            if (!users.length) continue;

            const todaysEvents = [];

            for (const evt of mosque.mosqueSpecialEvents[0].events) {
                const d = new Date(evt.date);
                if (d >= start && d <= end) todaysEvents.push(evt);
            }

            if (!todaysEvents.length) continue;

            const title = '🎉 Special events today';
            const lines = todaysEvents.map(evt => {
                const type = evt.eventType;
                const timingsStr = Array.isArray(evt.timings) && evt.timings.length
                    ? evt.timings.map(t => {
                        const timeStr = new Date(t.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                        return `${t.eventName} ${timeStr}`;
                    }).join(', ')
                    : 'Timings TBA';
                const notesStr = evt.notes ? ` — ${evt.notes}` : '';
                return `• ${type}: ${timingsStr}${notesStr}`;
            });
            let body = `${mosque.name} — ${todaysEvents.length} event(s) today\n` + lines.join('\n');

            const notificationData = {
                title,
                body,
                data: {
                    type: 'SPECIAL_EVENT',
                    mosqueId: mosque._id?.toString?.() || '',
                    eventsCount: todaysEvents.length
                },
                sound: 'default',
                priority: 'high'
            };

            await pushNotificationService.sendToUsers(users, notificationData);
        }
    } catch (error) {
        console.error('SpecialEventsScheduler error:', error);
    }
}

function start() {
    // runSpecialEventsNotificationOnce();
    // Run daily at 00:00 UTC
    cron.schedule('0 0 * * *', async () => {
        await runSpecialEventsNotificationOnce();
    }, { timezone: 'UTC' });
}

module.exports = { start };


