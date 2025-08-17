// Convert minutes from midnight to Date object
const convertMinutesToDate = (minutes, baseDate) => {
    const date = new Date(baseDate);
    date.setHours(Math.floor(minutes / 60));
    date.setMinutes(minutes % 60);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
};

// Get day of year from date
const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

// Get date from day number and year
const getDateFromDayNumber = (dayNumber, year) => {
    const date = new Date(year, 0); // January 1st
    date.setDate(dayNumber);
    return date;
};

// Format time helper
const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
};

// Format ICS date
const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

module.exports = {
    convertMinutesToDate,
    getDayOfYear,
    getDateFromDayNumber,
    formatTime,
    formatICSDate
};