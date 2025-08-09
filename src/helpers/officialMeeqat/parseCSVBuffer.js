// helpers/parseCSVBuffer.js
const csvParser = require('csv-parser');
const { Readable } = require('stream');

// Helper function to convert time string to minutes from midnight
const timeStringToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Helper function to parse CSV from buffer
const parseCSVBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const stream = Readable.from(buffer.toString());

        stream
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

// Validate CSV data
const validateCSVData = (data) => {
    const errors = [];
    const expectedColumns = ['Date', 'Fajr', 'Sunrise', 'Zenith', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    // Check if data exists
    if (!data || data.length === 0) {
        errors.push('CSV file is empty');
        return { isValid: false, errors };
    }

    // Check row count
    if (data.length !== 366) {
        errors.push(`CSV must have exactly 366 rows, found ${data.length}`);
        return { isValid: false, errors };
    }

    // Check columns
    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    const missingColumns = expectedColumns.filter(col => !columns.includes(col));

    if (missingColumns.length > 0) {
        errors.push(`Missing columns: ${missingColumns.join(', ')}`);
        return { isValid: false, errors };
    }

    // Validate each row
    const dateSet = new Set();
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const dateRegex = /^([1-9]|[12][0-9]|3[01])-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/;

    for (let index = 0; index < data.length; index++) {
        const row = data[index];
        const rowNum = index + 1;

        // Validate date format
        if (!dateRegex.test(row.Date)) {
            errors.push(`Row ${rowNum}: Invalid date format '${row.Date}'. Expected format: D-MMM (e.g., 1-Jan)`);
            return { isValid: false, errors };
        }

        // Check for duplicate dates
        if (dateSet.has(row.Date)) {
            errors.push(`Row ${rowNum}: Duplicate date '${row.Date}'`);
            return { isValid: false, errors };
        }
        dateSet.add(row.Date);

        // Validate prayer times format
        const prayers = ['Fajr', 'Sunrise', 'Zenith', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        for (const prayer of prayers) {
            if (!row[prayer]) {
                errors.push(`Row ${rowNum}: Missing ${prayer} time`);
                return { isValid: false, errors };
            } else if (!timeRegex.test(row[prayer])) {
                errors.push(`Row ${rowNum}: Invalid ${prayer} time format '${row[prayer]}'. Expected HH:MM`);
                return { isValid: false, errors };
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Convert CSV data to timings array with smart AM/PM interpretation
const convertCSVToTimings = (csvData) => {
    return csvData.map((row, index) => {
        const prayers = ['Fajr', 'Sunrise', 'Zenith', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const times = {};
        
        // First pass: convert all times to naive minutes (without AM/PM consideration)
        prayers.forEach(prayer => {
            times[prayer.toLowerCase()] = timeStringToMinutes(row[prayer]);
        });

        // Second pass: adjust times to ensure sequence
        let previousTime = times.fajr; // Fajr is always morning
        
        // Process remaining prayers in sequence
        for (let i = 1; i < prayers.length; i++) {
            const prayerKey = prayers[i].toLowerCase();
            let currentTime = times[prayerKey];
            
            // If current time is less than or equal to previous, it must be PM
            if (currentTime <= previousTime) {
                currentTime += 720; // Add 12 hours
                
                // If time goes past midnight, wrap around using modulus
                if (currentTime > 1439) {
                    currentTime = currentTime % 1440;
                }
                
                times[prayerKey] = currentTime;
            }
            
            previousTime = times[prayerKey];
        }

        return {
            date_csv: row.Date,
            dayNumber: index + 1,
            fajr: times.fajr,
            sunrise: times.sunrise,
            zenith: times.zenith,
            dhuhr: times.dhuhr,
            asr: times.asr,
            maghrib: times.maghrib,
            isha: times.isha
        };
    });
};

module.exports = {
    parseCSVBuffer,
    validateCSVData,
    convertCSVToTimings
};