// Helper function for Mosuqe Meeqat to convert date to dayNumber
const dateToDay = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const start = new Date(year, 0, 1); // Jan 1st of that year
    const dayNumber = Math.floor((date - start) / (24 * 60 * 60 * 1000)) + 1;
    return dayNumber;
};

// Helper function to get date range dayNumbers
const getDateRangeDayNumbers = (startDate, endDate) => {
    if (!startDate || !endDate) {
        // Default to full year (all 366 days)
        return { startDay: 1, endDay: 366 };
    }

    const startDay = dateToDay(startDate);
    const endDay = dateToDay(endDate);

    return { startDay, endDay };
};

module.exports = {
    dateToDay,
    getDateRangeDayNumbers
};