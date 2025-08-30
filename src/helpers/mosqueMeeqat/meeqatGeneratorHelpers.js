// Helper function for Mosuqe Meeqat
const { applySmartRounding } = require('./roundingHelpers');

// Generate timings with smart rounding
// Pre-compute prayer names array (avoid repeated array creation)
const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const generateTimings = (officialTimings, config) => {
    // Initialize interval trackers for each prayer (use array for better performance)
    const intervalTrackers = {
        fajr: { currentTarget: null },
        dhuhr: { currentTarget: null },
        asr: { currentTarget: null },
        maghrib: { currentTarget: null },
        isha: { currentTarget: null }
    };

    const timingsLength = officialTimings.length;
    const result = new Array(timingsLength); // Pre-allocate array

    // Use traditional for loop (faster than map/forEach)
    for (let i = 0; i < timingsLength; i++) {
        const day = officialTimings[i];
        
        const processedDay = {
            date_csv: day.date_csv,
            dayNumber: day.dayNumber,
            sunrise: day.sunrise, // No adjustment
            zenith: day.zenith,   // No adjustment
            isManuallyEdited: false,
            adhanTimes: {} // Pre-create object
        };

        // Process each prayer time with traditional for loop
        for (let j = 0; j < PRAYERS.length; j++) {
            const prayer = PRAYERS[j];
            const prayerConfig = config.jamaat[prayer] || {};
            let jamaatTime;

            // 1. Apply fixed time or delay
            if (prayerConfig.fixedTime !== null && prayerConfig.fixedTime !== undefined) {
                jamaatTime = prayerConfig.fixedTime;
            } else {
                jamaatTime = (day[prayer] + (prayerConfig.delay || 0)) % 1440;
                if (jamaatTime < 0) jamaatTime += 1440; // Handle negative overflow
            }

            // 2. Apply smart rounding
            jamaatTime = applySmartRounding(
                jamaatTime,
                prayerConfig.roundingInterval || 0,
                intervalTrackers[prayer]
            );
            // Ensure within bounds
            processedDay[prayer] = jamaatTime % 1440;

            // 3. Calculate adhan time immediately (better cache locality)
            const adhanGap = prayerConfig.adhanGap || 15;
            let adhanTime = jamaatTime - adhanGap;
            if (adhanTime < 0) adhanTime += 1440; // Handle negative overflow
            processedDay.adhanTimes[prayer] = adhanTime;
        }

        result[i] = processedDay;
    }

    return result;
};

module.exports = {
    generateTimings
};