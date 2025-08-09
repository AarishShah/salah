/**
 * Convert a date to day number (1-366)
 * Assumes non-leap year with 365 days, but supports day 366 for Feb 29th in leap years
 */
const dateToDay = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const dayNumber = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Ensure day number is within valid range
    return Math.min(Math.max(dayNumber, 1), 366);
};

/**
 * Get start and end day numbers from date strings
 */
const getDateRangeDayNumbers = (startDate, endDate) => {
    let startDay = 1;
    let endDay = 366;
    
    if (startDate) {
        const convertedStartDay = dateToDay(startDate);
        if (convertedStartDay) startDay = convertedStartDay;
    }
    
    if (endDate) {
        const convertedEndDay = dateToDay(endDate);
        if (convertedEndDay) endDay = convertedEndDay;
    }
    
    // Ensure start is not greater than end
    if (startDay > endDay) {
        [startDay, endDay] = [endDay, startDay];
    }
    
    return { startDay, endDay };
};

module.exports = {
    dateToDay,
    getDateRangeDayNumbers
};