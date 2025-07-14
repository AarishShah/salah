const csv = require('csv-parser');
const fs = require('fs');
const BaseTiming = require('../models/baseTiming.model');
const Location = require('../models/location.model');
const { isValid, parseISO } = require('date-fns');

// Helper: Validate time in HH:MM format
function isValidTime(str) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(str);
}

// Parse and validate CSV file
async function parseAndValidateCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        let headerChecked = false;
        let header;
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('headers', (headers) => {
                header = headers;
                const expected = ['Date', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
                if (headers.length !== 7 || !expected.every((h, i) => headers[i] === h)) {
                    return reject(new Error('CSV header must be: Date, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha'));
                }
                headerChecked = true;
            })
            .on('data', (row) => {
                if (!headerChecked) return;
                // Validate date
                const date = parseISO(row['Date']);
                if (!isValid(date)) {
                    return reject(new Error(`Invalid date: ${row['Date']}`));
                }
                // Validate times
                const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
                for (const p of prayers) {
                    if (!isValidTime(row[p])) {
                        return reject(new Error(`Invalid time for ${p}: ${row[p]}`));
                    }
                }
                results.push({
                    date,
                    fajr: row['Fajr'],
                    sunrise: row['Sunrise'],
                    dhuhr: row['Dhuhr'],
                    asr: row['Asr'],
                    maghrib: row['Maghrib'],
                    isha: row['Isha']
                });
            })
            .on('end', () => {
                if (results.length !== 366) {
                    return reject(new Error('CSV must contain 366 rows of timings'));
                }
                resolve(results);
            })
            .on('error', (err) => reject(err));
    });
}

// Save BaseTiming and Location
async function saveBaseTimingAndLocation(timings, locationName, coordinates) {
    const baseTiming = await BaseTiming.create({ timings });
    const location = await Location.create({
        name: locationName,
        coordinates,
        baseTiming: baseTiming._id
    });
    return { baseTiming, location };
}

module.exports = {
    parseAndValidateCSV,
    saveBaseTimingAndLocation
}; 