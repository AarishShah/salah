// Helper function for Mosuqe Meeqat
// Smart rounding function with interval tracking
const applySmartRounding = (adjustedTime, intervalSize, intervalTracker) => {
    if (intervalSize === 0) {
        return adjustedTime; // No rounding
    }

    // First day - establish initial target
    if (intervalTracker.currentTarget === null) {
        const timeOverInterval = adjustedTime / intervalSize;
        intervalTracker.currentTarget = Math.round(timeOverInterval) * intervalSize;
        return intervalTracker.currentTarget;
    }

    // Cache division results (avoid repeated calculations)
    const timeOverInterval = adjustedTime / intervalSize;
    const targetOverInterval = intervalTracker.currentTarget / intervalSize;

    // Calculate current zone and target zone
    const currentZone = Math.floor(timeOverInterval) * intervalSize;
    const targetZone = Math.floor(targetOverInterval) * intervalSize;

    // Check if crossed to new interval zone
    if (currentZone !== targetZone) {
        // Crossed boundary - establish new target
        intervalTracker.currentTarget = Math.round(timeOverInterval) * intervalSize;
    }

    // Return current target (maintains stability)
    return intervalTracker.currentTarget;
};

module.exports = {
    applySmartRounding
};