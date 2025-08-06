// Helper function to convert time input to minutes
const convertTimeToMinutes = (value) => {
    if (value === null || value === undefined) return null;
    
    // If already a number
    if (typeof value === 'number') {
        // Handle decimal numbers like 14.30 (14:30)
        if (value < 24) {
            const hours = Math.floor(value);
            const minutes = Math.round((value % 1) * 100);
            return hours * 60 + minutes;
        }
        // If it's already in minutes (0-1439), return as is
        if (value >= 0 && value <= 1439) {
            return value;
        }
        throw new Error(`Invalid time value: ${value}`);
    }
    
    // If string in HH:MM format
    if (typeof value === 'string') {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
            throw new Error(`Invalid time format: ${value}. Expected HH:MM`);
        }
        const [hours, minutes] = value.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    throw new Error(`Invalid time type: ${typeof value}`);
};

// Helper function to process time fields in config data
const processTimeFields = (data) => {
    const processedData = { ...data };
    
    try {
        // Process jamaat fixed times
        if (processedData.jamaat) {
            const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
            prayers.forEach(prayer => {
                if (processedData.jamaat[prayer] && processedData.jamaat[prayer].fixedTime !== undefined) {
                    processedData.jamaat[prayer].fixedTime = convertTimeToMinutes(processedData.jamaat[prayer].fixedTime);
                }
            });
        }
        
        // Process jummah times
        if (processedData.jummah) {
            const jummahFields = ['khutbahStartTime', 'jamaatTime'];
            jummahFields.forEach(field => {
                if (processedData.jummah[field] !== undefined) {
                    processedData.jummah[field] = convertTimeToMinutes(processedData.jummah[field]);
                }
            });
        }
        
        return { success: true, data: processedData };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    processTimeFields,
    convertTimeToMinutes
};
