/**
 * Get date range with defaults to current year if not provided
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Object} Object containing startDate and endDate as Date objects
 */
const getDateRange = (startDate, endDate) => {
    const currentYear = new Date().getFullYear();

    // Check each date individually and apply defaults if needed
    let start = startDate ? new Date(startDate) : new Date(`${currentYear}-01-01`);
    let end = endDate ? new Date(endDate) : new Date(`${currentYear}-12-31`);

    // Set start date to beginning of day (00:00:00)
    start.setHours(0, 0, 0, 0);

    // Set end date to end of day (23:59:59.999) to ensure inclusive comparison
    end.setHours(23, 59, 59, 999);

    // Ensure start is not greater than end
    if (start > end) {
        [start, end] = [end, start];
    }

    return {
        startDate: start,
        endDate: end
    };
};

module.exports = {
    getDateRange
};