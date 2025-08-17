/**
 * Get date range with defaults to current year if not provided
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Object} Object containing startDate and endDate as Date objects
 */
const getDateRange = (startDate, endDate) => {
    const currentYear = new Date().getFullYear();
    
    // Default date range to current year if not provided
    if (!startDate || !endDate) {
        return {
            startDate: new Date(`${currentYear}-01-01`),
            endDate: new Date(`${currentYear}-12-31`)
        };
    }
    
    return {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
    };
};

module.exports = {
    getDateRange
};