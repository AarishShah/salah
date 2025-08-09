const MosqueMeeqat = require('../models/mosqueMeeqat.model');
const Mosque = require('../models/mosque.model');
const { getDateRangeDayNumbers } = require('../helpers/mosqueMeeqat/dateHelpers');
const { formatTimings } = require('../helpers/mosqueMeeqat/timeFormatHelpers');
const { generateTimings } = require('../helpers/mosqueMeeqat/meeqatGeneratorHelpers');
const { buildMosqueMeeqatPipeline } = require('../helpers/mosqueMeeqat/pipelineHelpers');
const { generateMosqueMeeqatHTML } = require('../helpers/mosqueMeeqat/htmlHelpers');

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

        // Convert dates to day numbers
        const { startDay, endDay } = getDateRangeDayNumbers(startDate, endDate);

        // Use the helper pipeline
        const pipeline = buildMosqueMeeqatPipeline(mosque._id, startDay, endDay);
        const result = await MosqueMeeqat.aggregate(pipeline);

        if (!result || result.length === 0) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active mosque meeqat found for this mosque'
            };
        }

        const mosqueMeeqat = result[0];

        // Apply time format conversion to filtered timings
        const formattedTimings = formatTimings(mosqueMeeqat.timings, timeFormat);

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
                timings: formattedTimings
            },
            dateRange: {
                startDate: startDate || 'Full year',
                endDate: endDate || 'Full year',
                startDayNumber: startDay,
                endDayNumber: endDay,
                totalDays: formattedTimings.length
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

        // Convert dates to day numbers
        const { startDay, endDay } = getDateRangeDayNumbers(startDate, endDate);

        // Use the same pipeline
        const pipeline = buildMosqueMeeqatPipeline(mosque._id, startDay, endDay);
        const result = await MosqueMeeqat.aggregate(pipeline);

        if (!result || result.length === 0) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active mosque meeqat found for this mosque'
            };
        }

        const mosqueMeeqat = result[0];
        const formattedTimings = formatTimings(mosqueMeeqat.timings, timeFormat);

        // Prepare data for HTML
        const mosqueMeeqatForHTML = {
            ...mosqueMeeqat,
            timings: formattedTimings
        };

        const dateRange = {
            startDate: startDate || 'Full year',
            endDate: endDate || 'Full year',
            startDayNumber: startDay,
            endDayNumber: endDay,
            totalDays: formattedTimings.length
        };

        // Generate HTML
        const html = generateMosqueMeeqatHTML(mosqueMeeqatForHTML, dateRange, timeFormat);

        return {
            status: 'success',
            html: html
        };

    } catch (error) {
        console.error('GetMosqueMeeqatHTML error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to generate mosque meeqat HTML'
        };
    }
};

// Generate new mosque meeqat
const generateMosqueMeeqat = async (mosqueId, userId) => {
    try {
        // Parallelize initial queries with lean() for better performance
        const [mosque, existingMeeqat] = await Promise.all([
            Mosque.findById(mosqueId)
                .populate('officialMeeqat', 'timings locationName publisher sect schoolOfThought')
                .populate('meeqatConfig')
                .lean(), // Use lean for read-only data
            MosqueMeeqat.findOne({ mosque: mosqueId }).lean()
        ]);

        // Early validation (fail fast)
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

        // Parallelize save operations
        const [savedMeeqat] = await Promise.all([
            newMosqueMeeqat.save(),
            Mosque.findByIdAndUpdate(mosqueId, { mosqueMeeqat: newMosqueMeeqat._id })
        ]);

        // Single populate call with multiple paths (1 database roundtrip)
        await savedMeeqat.populate([
            { path: 'mosque', select: 'name address locality' },
            { path: 'sourceOfficialMeeqat', select: 'locationName publisher sect schoolOfThought' },
            { path: 'generatedBy', select: 'name email' }
        ]);

        return {
            status: 'success',
            message: 'Mosque meeqat generated successfully',
            mosqueMeeqat: {
                _id: savedMeeqat._id,
                mosque: savedMeeqat.mosque,
                sourceOfficialMeeqat: savedMeeqat.sourceOfficialMeeqat,
                version: savedMeeqat.version,
                generatedAt: savedMeeqat.generatedAt,
                generatedBy: savedMeeqat.generatedBy,
                isApproved: savedMeeqat.isApproved,
                timingsCount: savedMeeqat.timings.length
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