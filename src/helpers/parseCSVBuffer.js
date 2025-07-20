const csvParser = require('csv-parser');
const { Readable } = require('stream');

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
exports.parseCSVBuffer = parseCSVBuffer;
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
        return { isValid: false, errors }; // Stop here if row count is wrong
    }

    // Check columns
    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    const missingColumns = expectedColumns.filter(col => !columns.includes(col));

    if (missingColumns.length > 0) {
        errors.push(`Missing columns: ${missingColumns.join(', ')}`);
        return { isValid: false, errors }; // Stop here if columns are missing
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
            return { isValid: false, errors }; // Stop on first error
        }

        // Check for duplicate dates
        if (dateSet.has(row.Date)) {
            errors.push(`Row ${rowNum}: Duplicate date '${row.Date}'`);
            return { isValid: false, errors }; // Stop on first error
        }
        dateSet.add(row.Date);

        // Validate prayer times
        const prayers = ['Fajr', 'Sunrise', 'Zenith', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        for (const prayer of prayers) {
            if (!row[prayer]) {
                errors.push(`Row ${rowNum}: Missing ${prayer} time`);
                return { isValid: false, errors }; // Stop on first error
            } else if (!timeRegex.test(row[prayer])) {
                errors.push(`Row ${rowNum}: Invalid ${prayer} time format '${row[prayer]}'. Expected HH:MM`);
                return { isValid: false, errors }; // Stop on first error
            }
        }

        // Uncomment this section when our csv data is ready for time sequence validation
        // Validate time sequence
        // const times = prayers.map(p => {
        //     const [h, m] = row[p].split(':').map(Number);
        //     return h * 60 + m;
        // });
        // for (let i = 1; i < times.length; i++) {
        //     if (times[i] <= times[i - 1]) {
        //         errors.push(`Row ${rowNum}: ${prayers[i]} time must be after ${prayers[i - 1]}`);
        //         return { isValid: false, errors }; // Stop on first error
        //     }
        // }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};
exports.validateCSVData = validateCSVData;
// Convert CSV data to timings array
const convertCSVToTimings = (csvData) => {
    return csvData.map((row, index) => ({
        date_csv: row.Date,
        dayNumber: index + 1,
        fajr: row.Fajr,
        sunrise: row.Sunrise,
        zenith: row.Zenith,
        dhuhr: row.Dhuhr,
        asr: row.Asr,
        maghrib: row.Maghrib,
        isha: row.Isha
    }));
};
exports.convertCSVToTimings = convertCSVToTimings;
