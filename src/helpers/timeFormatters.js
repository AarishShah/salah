// helpers/timeFormatters.js
const minutesToTimeString12h = (minutes) => {
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
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const formatTimings = (timings, format = '12h') => {
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

module.exports = {
    minutesToTimeString12h,
    minutesToTimeString24h,
    formatTimings
};