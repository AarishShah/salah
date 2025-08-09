// Helper to format Meeqat configuration times in 12-hour or 24-hour format

const { minutesToTimeString12h, minutesToTimeString24h } = require('../../utils/timeUtils');

const formatTime = (config, format = '12h') => {
    const formatter = format === '24h' ? minutesToTimeString24h : minutesToTimeString12h;
    const formattedConfig = JSON.parse(JSON.stringify(config)); // Deep clone

    // Format jamaat fixed times
    if (formattedConfig.jamaat) {
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        prayers.forEach(prayer => {
            if (formattedConfig.jamaat[prayer] && formattedConfig.jamaat[prayer].fixedTime !== null) {
                formattedConfig.jamaat[prayer].fixedTime = formatter(formattedConfig.jamaat[prayer].fixedTime);
            }
        });
    }

    // Format jummah times
    if (formattedConfig.jummah) {
        const jummahFields = ['khutbahStartTime', 'jamaatTime'];
        jummahFields.forEach(field => {
            if (formattedConfig.jummah[field] !== null && formattedConfig.jummah[field] !== undefined) {
                formattedConfig.jummah[field] = formatter(formattedConfig.jummah[field]);
            }
        });
    }

    return formattedConfig;
};

module.exports = { formatTime };
