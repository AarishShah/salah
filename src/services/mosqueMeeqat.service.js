const MosqueMeeqat = require('../models/mosqueMeeqat.model');
const Mosque = require('../models/mosque.model');
const { minutesToTimeString12h, minutesToTimeString24h } = require('../utils/timeUtils');

// Helper function to convert date to dayNumber
const dateToDay = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const start = new Date(year, 0, 1); // Jan 1st of that year
    const dayNumber = Math.floor((date - start) / (24 * 60 * 60 * 1000)) + 1;
    return dayNumber;
};

// Helper function to determine if year is leap year
const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
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

// Helper function to apply time format conversion
const formatTimings = (timings, timeFormat) => {
    if (timeFormat === 'original') {
        return timings; // Return as-is (minutes format)
    }

    const formatFunction = timeFormat === '24h' ? minutesToTimeString24h : minutesToTimeString12h;

    return timings.map(timing => ({
        ...timing,
        fajr: formatFunction(timing.fajr),
        sunrise: formatFunction(timing.sunrise),
        zenith: formatFunction(timing.zenith),
        dhuhr: formatFunction(timing.dhuhr),
        asr: formatFunction(timing.asr),
        maghrib: formatFunction(timing.maghrib),
        isha: formatFunction(timing.isha),
        adhanTimes: {
            fajr: formatFunction(timing.adhanTimes.fajr),
            dhuhr: formatFunction(timing.adhanTimes.dhuhr),
            asr: formatFunction(timing.adhanTimes.asr),
            maghrib: formatFunction(timing.adhanTimes.maghrib),
            isha: formatFunction(timing.adhanTimes.isha)
        }
    }));
};

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

// Generate timings with smart rounding
const generateTimings = (officialTimings, config) => {
    // Initialize interval trackers for each prayer
    const intervalTrackers = {
        fajr: { currentTarget: null },
        dhuhr: { currentTarget: null },
        asr: { currentTarget: null },
        maghrib: { currentTarget: null },
        isha: { currentTarget: null }
    };

    return officialTimings.map(day => {
        const processedDay = {
            date_csv: day.date_csv,
            dayNumber: day.dayNumber,
            sunrise: day.sunrise, // No adjustment
            zenith: day.zenith,   // No adjustment
            isManuallyEdited: false
        };

        // Process each prayer time
        ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
            const prayerConfig = config.jamaat[prayer];
            let jamaatTime;

            // 1. Apply fixed time or delay
            if (prayerConfig.fixedTime !== null && prayerConfig.fixedTime !== undefined) {
                jamaatTime = prayerConfig.fixedTime;
            } else {
                // Apply delay to official time
                jamaatTime = (day[prayer] + (prayerConfig.delay || 0)) % 1440;
                if (jamaatTime < 0) jamaatTime += 1440; // Handle negative overflow
            }

            // 2. Apply smart rounding
            jamaatTime = applySmartRounding(
                jamaatTime,
                prayerConfig.roundingInterval || 0,
                intervalTrackers[prayer]
            );

            // Ensure within bounds
            jamaatTime = jamaatTime % 1440;

            processedDay[prayer] = jamaatTime;
        });

        // 3. Calculate adhan times
        processedDay.adhanTimes = {};
        ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
            const adhanGap = config.jamaat[prayer].adhanGap || 15;
            let adhanTime = processedDay[prayer] - adhanGap;
            if (adhanTime < 0) adhanTime += 1440; // Handle negative overflow
            processedDay.adhanTimes[prayer] = adhanTime;
        });

        return processedDay;
    });
};

// Get mosque meeqat with filtering and formatting
const getMosqueMeeqat = async (mosqueId, options = {}) => {
    try {
        const { startDate, endDate, timeFormat = '12h' } = options;

        // Check if mosque exists
        const mosque = await Mosque.findById(mosqueId);
        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        // Find active mosque meeqat
        const mosqueMeeqat = await MosqueMeeqat.findOne({ mosque: mosqueId, isActive: true })
            .populate('mosque', 'name address locality')
            .populate('sourceOfficialMeeqat', 'locationName publisher sect schoolOfThought')
            .populate('generatedBy', 'name email')
            .populate('approvedBy', 'name email');

        if (!mosqueMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active mosque meeqat found for this mosque'
            };
        }

        // Get date range
        const { startDay, endDay } = getDateRangeDayNumbers(startDate, endDate);

        // Filter timings by dayNumber range
        let filteredTimings = mosqueMeeqat.timings.filter(timing => 
            timing.dayNumber >= startDay && timing.dayNumber <= endDay
        );

        // Apply time format conversion
        filteredTimings = formatTimings(filteredTimings, timeFormat);

        return {
            status: 'success',
            mosqueMeeqat: {
                _id: mosqueMeeqat._id,
                mosque: mosqueMeeqat.mosque,
                sourceOfficialMeeqat: mosqueMeeqat.sourceOfficialMeeqat,
                version: mosqueMeeqat.version,
                generatedAt: mosqueMeeqat.generatedAt,
                generatedBy: mosqueMeeqat.generatedBy,
                isApproved: mosqueMeeqat.isApproved,
                approvedBy: mosqueMeeqat.approvedBy,
                approvedAt: mosqueMeeqat.approvedAt,
                timings: filteredTimings
            },
            dateRange: {
                startDate: startDate || 'Full year',
                endDate: endDate || 'Full year',
                startDayNumber: startDay,
                endDayNumber: endDay,
                totalDays: filteredTimings.length
            },
            timeFormat
        };
    } catch (error) {
        console.error('GetMosqueMeeqat error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch mosque meeqat'
        };
    }
};

// Generate HTML for download
const generateMeeqatHTML = async (mosqueId, options = {}) => {
    try {
        // Get the data first
        const result = await getMosqueMeeqat(mosqueId, options);

        if (result.status === 'failed') {
            return result;
        }

        const { mosqueMeeqat, dateRange, timeFormat } = result;

        // Generate filename
        const mosqueName = mosqueMeeqat.mosque.name.replace(/[^a-zA-Z0-9]/g, '-');
        const dateString = dateRange.startDate === 'Full year' ? 'Full-Year' : 
            `${dateRange.startDate}-to-${dateRange.endDate}`;
        const filename = `${mosqueName}-Meeqat-${dateString}-${timeFormat}.html`;

        // Generate HTML content
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${mosqueMeeqat.mosque.name} - Prayer Timetable</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .edited { background-color: #fff3cd; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${mosqueMeeqat.mosque.name}</h1>
        <h2>Prayer Timetable</h2>
        <p>${mosqueMeeqat.mosque.address}, ${mosqueMeeqat.mosque.locality}</p>
    </div>

    <div class="info">
        <strong>Date Range:</strong> ${dateRange.startDate} to ${dateRange.endDate} (${dateRange.totalDays} days)<br>
        <strong>Time Format:</strong> ${timeFormat.toUpperCase()}<br>
        <strong>Source:</strong> ${mosqueMeeqat.sourceOfficialMeeqat.locationName} - ${mosqueMeeqat.sourceOfficialMeeqat.publisher}<br>
        <strong>Generated:</strong> ${new Date(mosqueMeeqat.generatedAt).toLocaleDateString()}<br>
        <strong>Status:</strong> ${mosqueMeeqat.isApproved ? 'Approved' : 'Pending Approval'}
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Fajr</th>
                <th>Sunrise</th>
                <th>Dhuhr</th>
                <th>Asr</th>
                <th>Maghrib</th>
                <th>Isha</th>
            </tr>
        </thead>
        <tbody>
            ${mosqueMeeqat.timings.map(timing => `
                <tr class="${timing.isManuallyEdited ? 'edited' : ''}">
                    <td>${timing.date_csv}</td>
                    <td>${timing.dayNumber}</td>
                    <td>${timing.fajr}</td>
                    <td>${timing.sunrise}</td>
                    <td>${timing.dhuhr}</td>
                    <td>${timing.asr}</td>
                    <td>${timing.maghrib}</td>
                    <td>${timing.isha}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Version: ${mosqueMeeqat.version}</p>
    </div>
</body>
</html>`;

        return {
            status: 'success',
            html,
            filename
        };
    } catch (error) {
        console.error('GenerateMeeqatHTML error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to generate HTML'
        };
    }
};

// Generate new mosque meeqat
const generateMosqueMeeqat = async (mosqueId, userId) => {
    try {
        // Get mosque with references
        const mosque = await Mosque.findById(mosqueId)
            .populate('officialMeeqat')
            .populate('meeqatConfig');

        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        if (!mosque.officialMeeqat) {
            return {
                status: 'failed',
                code: 400,
                message: 'No official meeqat linked to this mosque'
            };
        }

        if (!mosque.meeqatConfig) {
            return {
                status: 'failed',
                code: 400,
                message: 'No meeqat config found for this mosque'
            };
        }

        // Check if active mosqueMeeqat already exists
        const existingMeeqat = await MosqueMeeqat.findOne({ 
            mosque: mosqueId, 
            isActive: true 
        });

        if (existingMeeqat) {
            return {
                status: 'failed',
                code: 409,
                message: 'Active mosque meeqat already exists. Please delete or deactivate the existing one before generating new.'
            };
        }

        // Generate timings based on config
        const generatedTimings = generateTimings(
            mosque.officialMeeqat.timings,
            mosque.meeqatConfig
        );

        // Create config snapshot
        const configSnapshot = {
            jamaat: mosque.meeqatConfig.jamaat,
            jummah: mosque.meeqatConfig.jummah
        };

        // Create new mosqueMeeqat
        const newMosqueMeeqat = new MosqueMeeqat({
            mosque: mosqueId,
            sourceOfficialMeeqat: mosque.officialMeeqat._id,
            configSnapshot,
            timings: generatedTimings,
            generatedBy: userId,
            isApproved: false,
            version: 1,
            isActive: true
        });

        await newMosqueMeeqat.save();

        // Update mosque reference
        mosque.mosqueMeeqat = newMosqueMeeqat._id;
        await mosque.save();

        // Populate before returning
        await newMosqueMeeqat.populate('mosque', 'name address locality');
        await newMosqueMeeqat.populate('sourceOfficialMeeqat', 'locationName publisher sect schoolOfThought');
        await newMosqueMeeqat.populate('generatedBy', 'name email');

        return {
            status: 'success',
            message: 'Mosque meeqat generated successfully',
            mosqueMeeqat: {
                _id: newMosqueMeeqat._id,
                mosque: newMosqueMeeqat.mosque,
                sourceOfficialMeeqat: newMosqueMeeqat.sourceOfficialMeeqat,
                version: newMosqueMeeqat.version,
                generatedAt: newMosqueMeeqat.generatedAt,
                generatedBy: newMosqueMeeqat.generatedBy,
                isApproved: newMosqueMeeqat.isApproved,
                timingsCount: newMosqueMeeqat.timings.length
            }
        };
    } catch (error) {
        console.error('GenerateMosqueMeeqat error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to generate mosque meeqat'
        };
    }
};

// Approve mosque meeqat
const approveMosqueMeeqat = async (mosqueId, userId) => {
    try {
        // Find active mosqueMeeqat
        const mosqueMeeqat = await MosqueMeeqat.findOne({ 
            mosque: mosqueId, 
            isActive: true 
        });

        if (!mosqueMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active mosque meeqat found for this mosque'
            };
        }

        if (mosqueMeeqat.isApproved) {
            return {
                status: 'failed',
                code: 400,
                message: 'Mosque meeqat is already approved'
            };
        }

        // Approve
        mosqueMeeqat.isApproved = true;
        mosqueMeeqat.approvedBy = userId;
        mosqueMeeqat.approvedAt = new Date();
        await mosqueMeeqat.save();

        // Populate before returning
        await mosqueMeeqat.populate('mosque', 'name address locality');
        await mosqueMeeqat.populate('approvedBy', 'name email');

        return {
            status: 'success',
            message: 'Mosque meeqat approved successfully',
            mosqueMeeqat: {
                _id: mosqueMeeqat._id,
                mosque: mosqueMeeqat.mosque,
                version: mosqueMeeqat.version,
                isApproved: mosqueMeeqat.isApproved,
                approvedBy: mosqueMeeqat.approvedBy,
                approvedAt: mosqueMeeqat.approvedAt
            }
        };
    } catch (error) {
        console.error('ApproveMosqueMeeqat error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to approve mosque meeqat'
        };
    }
};

// Update mosque meeqat
const updateMosqueMeeqat = async (mosqueId, updateData, userId) => {
    try {
        // Find active mosqueMeeqat
        const mosqueMeeqat = await MosqueMeeqat.findOne({ 
            mosque: mosqueId, 
            isActive: true 
        });

        if (!mosqueMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active mosque meeqat found for this mosque'
            };
        }

        // Handle day-specific updates
        if (updateData.dayNumber && updateData.timingUpdate) {
            const dayIndex = mosqueMeeqat.timings.findIndex(
                t => t.dayNumber === updateData.dayNumber
            );

            if (dayIndex === -1) {
                return {
                    status: 'failed',
                    code: 400,
                    message: 'Invalid day number'
                };
            }

            // Validate timing updates (ensure they're in minutes format 0-1439)
            const validTimeFields = ['fajr', 'sunrise', 'zenith', 'dhuhr', 'asr', 'maghrib', 'isha'];
            const validAdhanFields = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

            // Update prayer times
            validTimeFields.forEach(field => {
                if (updateData.timingUpdate[field] !== undefined) {
                    const timeValue = updateData.timingUpdate[field];
                    if (timeValue < 0 || timeValue > 1439) {
                        throw new Error(`Invalid ${field} time: must be between 0-1439 minutes`);
                    }
                    mosqueMeeqat.timings[dayIndex][field] = timeValue;
                }
            });

            // Update adhan times if provided
            if (updateData.timingUpdate.adhanTimes) {
                validAdhanFields.forEach(field => {
                    if (updateData.timingUpdate.adhanTimes[field] !== undefined) {
                        const timeValue = updateData.timingUpdate.adhanTimes[field];
                        if (timeValue < 0 || timeValue > 1439) {
                            throw new Error(`Invalid ${field} adhan time: must be between 0-1439 minutes`);
                        }
                        mosqueMeeqat.timings[dayIndex].adhanTimes[field] = timeValue;
                    }
                });
            }

            // Mark as manually edited
            mosqueMeeqat.timings[dayIndex].isManuallyEdited = true;
            mosqueMeeqat.timings[dayIndex].editedBy = userId;
            mosqueMeeqat.timings[dayIndex].editedAt = new Date();
            mosqueMeeqat.timings[dayIndex].editReason = updateData.editReason || 'Manual adjustment';
        }

        // Handle bulk updates (multiple days)
        if (updateData.bulkUpdates && Array.isArray(updateData.bulkUpdates)) {
            for (const bulkUpdate of updateData.bulkUpdates) {
                if (!bulkUpdate.dayNumber || !bulkUpdate.timingUpdate) {
                    continue; // Skip invalid bulk updates
                }

                const dayIndex = mosqueMeeqat.timings.findIndex(
                    t => t.dayNumber === bulkUpdate.dayNumber
                );

                if (dayIndex === -1) {
                    continue; // Skip invalid day numbers
                }

                // Apply same validation and updates as single day
                const validTimeFields = ['fajr', 'sunrise', 'zenith', 'dhuhr', 'asr', 'maghrib', 'isha'];
                const validAdhanFields = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

                // Update prayer times
                validTimeFields.forEach(field => {
                    if (bulkUpdate.timingUpdate[field] !== undefined) {
                        const timeValue = bulkUpdate.timingUpdate[field];
                        if (timeValue >= 0 && timeValue <= 1439) {
                            mosqueMeeqat.timings[dayIndex][field] = timeValue;
                        }
                    }
                });

                // Update adhan times if provided
                if (bulkUpdate.timingUpdate.adhanTimes) {
                    validAdhanFields.forEach(field => {
                        if (bulkUpdate.timingUpdate.adhanTimes[field] !== undefined) {
                            const timeValue = bulkUpdate.timingUpdate.adhanTimes[field];
                            if (timeValue >= 0 && timeValue <= 1439) {
                                mosqueMeeqat.timings[dayIndex].adhanTimes[field] = timeValue;
                            }
                        }
                    });
                }

                // Mark as manually edited
                mosqueMeeqat.timings[dayIndex].isManuallyEdited = true;
                mosqueMeeqat.timings[dayIndex].editedBy = userId;
                mosqueMeeqat.timings[dayIndex].editedAt = new Date();
                mosqueMeeqat.timings[dayIndex].editReason = bulkUpdate.editReason || 'Bulk manual adjustment';
            }
        }

        // Increment version and save
        mosqueMeeqat.version += 1;
        await mosqueMeeqat.save();

        // Populate before returning
        await mosqueMeeqat.populate('mosque', 'name address locality');

        return {
            status: 'success',
            message: 'Mosque meeqat updated successfully',
            mosqueMeeqat: {
                _id: mosqueMeeqat._id,
                mosque: mosqueMeeqat.mosque,
                version: mosqueMeeqat.version,
                updatedAt: mosqueMeeqat.updatedAt,
                totalTimings: mosqueMeeqat.timings.length
            }
        };
    } catch (error) {
        console.error('UpdateMosqueMeeqat error:', error);
        return {
            status: 'failed',
            code: 500,
            message: error.message || 'Failed to update mosque meeqat'
        };
    }
};

// Permanently delete mosque meeqat
const deleteMosqueMeeqat = async (mosqueId) => {
    try {
        // Check if mosque exists
        const mosque = await Mosque.findById(mosqueId);
        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        // Find active mosqueMeeqat
        const mosqueMeeqat = await MosqueMeeqat.findOne({ 
            mosque: mosqueId, 
            isActive: true 
        });

        if (!mosqueMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active mosque meeqat found for this mosque'
            };
        }

        // Remove mosque reference first
        await Mosque.findByIdAndUpdate(
            mosqueId,
            { $unset: { mosqueMeeqat: 1 } }
        );

        // Permanently delete the document
        await MosqueMeeqat.deleteOne({ _id: mosqueMeeqat._id });

        return {
            status: 'success',
            message: 'Mosque meeqat deleted permanently'
        };
    } catch (error) {
        console.error('DeleteMosqueMeeqat error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to delete mosque meeqat'
        };
    }
};

module.exports = {
    getMosqueMeeqat,
    generateMeeqatHTML,
    generateMosqueMeeqat,
    approveMosqueMeeqat,
    updateMosqueMeeqat,
    deleteMosqueMeeqat
};