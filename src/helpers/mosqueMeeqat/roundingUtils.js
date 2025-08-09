// Helper function for Mosuqe Meeqat
// Smart rounding function with interval tracking
const applySmartRounding = (adjustedTime, intervalSize, intervalTracker) => {
    if (intervalSize === 0) {
        return adjustedTime; // No rounding
    }

    // First day - establish initial target
    if (intervalTracker.currentTarget === null) {
        intervalTracker.currentTarget = Math.round(adjustedTime / intervalSize) * intervalSize;
        return intervalTracker.currentTarget;
    }

    // Calculate current zone and target zone
    const currentZone = Math.floor(adjustedTime / intervalSize) * intervalSize;
    const targetZone = Math.floor(intervalTracker.currentTarget / intervalSize) * intervalSize;

    // Check if crossed to new interval zone
    if (currentZone !== targetZone) {
        // Crossed boundary - establish new target
        intervalTracker.currentTarget = Math.round(adjustedTime / intervalSize) * intervalSize;
    }

    // Return current target (maintains stability)
    return intervalTracker.currentTarget;
};

module.exports = {
    applySmartRounding
};