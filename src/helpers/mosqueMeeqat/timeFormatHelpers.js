// Helper function for Mosuqe Meeqat to format prayer timings in different time formats
const { minutesToTimeString12h, minutesToTimeString24h } = require('../../utils/timeUtils');

// Helper function to apply time format conversion
const formatTimings = (timings, timeFormat) => {
    if (timeFormat === 'original') {
        return timings; // Return as-is (minutes format)
    }

    const formatFunction = timeFormat === '24h' ? minutesToTimeString24h : minutesToTimeString12h;

    return timings.map(timing => ({
        ...timing,
        fajr: formatFunction(timing.fajr),
        sunrise: formatFunction(timing.sunrise),
        zenith: formatFunction(timing.zenith),
        dhuhr: formatFunction(timing.dhuhr),
        asr: formatFunction(timing.asr),
        maghrib: formatFunction(timing.maghrib),
        isha: formatFunction(timing.isha),
        adhanTimes: {
            fajr: formatFunction(timing.adhanTimes.fajr),
            dhuhr: formatFunction(timing.adhanTimes.dhuhr),
            asr: formatFunction(timing.adhanTimes.asr),
            maghrib: formatFunction(timing.adhanTimes.maghrib),
            isha: formatFunction(timing.adhanTimes.isha)
        }
    }));
};

module.exports = {
    formatTimings
};