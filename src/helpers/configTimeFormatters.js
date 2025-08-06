// helpers/configTimeFormatters.js

const minutesToTimeString12h = (minutes) => {
    if (minutes === null || minutes === undefined) return null;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    // If hour is 0, display 12 (midnight in 12-hour format). 00:00 should be 12:00 AM
    // Else if hour greater than 12, subtract 12 to convert to 12-hour clock afternoon times. 15:00 - 12 = 3:00 PM
    // Otherwise, just use the hour as it is (for hours 1 to 12)
    
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
};

const minutesToTimeString24h = (minutes) => {
    if (minutes === null || minutes === undefined) return null;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const formatMeeqatConfig = (config, format = '12h') => {
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

module.exports = {
    minutesToTimeString12h,
    minutesToTimeString24h,
    formatMeeqatConfig
};