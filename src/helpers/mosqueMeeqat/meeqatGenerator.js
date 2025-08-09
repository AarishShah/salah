// Helper function for Mosuqe Meeqat
const { applySmartRounding } = require('./roundingUtils');

// Generate timings with smart rounding
const generateTimings = (officialTimings, config) => {
    // Initialize interval trackers for each prayer
    const intervalTrackers = {
        fajr: { currentTarget: null },
        dhuhr: { currentTarget: null },
        asr: { currentTarget: null },
        maghrib: { currentTarget: null },
        isha: { currentTarget: null }
    };

    return officialTimings.map(day => {
        const processedDay = {
            date_csv: day.date_csv,
            dayNumber: day.dayNumber,
            sunrise: day.sunrise, // No adjustment
            zenith: day.zenith,   // No adjustment
            isManuallyEdited: false
        };

        // Process each prayer time
        ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
            const prayerConfig = config.jamaat[prayer];
            let jamaatTime;

            // 1. Apply fixed time or delay
            if (prayerConfig.fixedTime !== null && prayerConfig.fixedTime !== undefined) {
                jamaatTime = prayerConfig.fixedTime;
            } else {
                // Apply delay to official time
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
            jamaatTime = jamaatTime % 1440;

            processedDay[prayer] = jamaatTime;
        });

        // 3. Calculate adhan times
        processedDay.adhanTimes = {};
        ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
            const adhanGap = config.jamaat[prayer].adhanGap || 15;
            let adhanTime = processedDay[prayer] - adhanGap;
            if (adhanTime < 0) adhanTime += 1440; // Handle negative overflow
            processedDay.adhanTimes[prayer] = adhanTime;
        });

        return processedDay;
    });
};

module.exports = {
    generateTimings
};