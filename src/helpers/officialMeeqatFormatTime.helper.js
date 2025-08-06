// Helper to format official Meeqat times in 12-hour or 24-hour format

const { minutesToTimeString12h, minutesToTimeString24h } = require('../utils/timeUtils');

const formatTime = (timings, format = '12h') => {
    const formatter = format === '24h' ? minutesToTimeString24h : minutesToTimeString12h;

    return timings.map(timing => ({
        date_csv: timing.date_csv,
        dayNumber: timing.dayNumber,
        fajr: formatter(timing.fajr),
        sunrise: formatter(timing.sunrise),
        zenith: formatter(timing.zenith),
        dhuhr: formatter(timing.dhuhr),
        asr: formatter(timing.asr),
        maghrib: formatter(timing.maghrib),
        isha: formatter(timing.isha)
    }));
};

module.exports = { formatTime };
