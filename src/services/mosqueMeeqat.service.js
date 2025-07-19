const MosqueMeeqat = require('../models/mosqueMeeqat.model');
const Mosque = require('../models/mosque.model');
const MeeqatConfig = require('../models/meeqatConfig.model');
const OfficialMeeqat = require('../models/officialMeeqat.model');

// Helper function to check mosque access
const checkMosqueAccess = (mosqueId, role, assignedMosques) => {
    if (role === 'admin') return true;
    return assignedMosques.some(id => id.toString() === mosqueId.toString());
};

// Helper function to apply config rules to generate timings
const generateTimings = (officialTimings, config) => {
    // This is where you'd implement the logic to:
    // 1. Apply delays/fixed times
    // 2. Apply rounding rules
    // 3. Calculate adhan times
    // Returns 366 days of processed timings
    return officialTimings.map(day => {
        // Simplified example - implement full logic here
        const processedDay = {
            date_csv: day.date_csv,
            dayNumber: day.dayNumber,
            fajr: day.fajr, // Apply config.jamaat.fajr rules
            sunrise: day.sunrise,
            zenith: day.zenith,
            dhuhr: day.dhuhr, // Apply config.jamaat.dhuhr rules
            asr: day.asr, // Apply config.jamaat.asr rules
            maghrib: day.maghrib, // Apply config.jamaat.maghrib rules
            isha: day.isha, // Apply config.jamaat.isha rules
            adhanTimes: {
                fajr: day.fajr, // Calculate based on adhanGap
                dhuhr: day.dhuhr,
                asr: day.asr,
                maghrib: day.maghrib,
                isha: day.isha
            },
            isManuallyEdited: false
        };
        return processedDay;
    });
};

// Get mosqueMeeqat by mosque ID
const getMosqueMeeqatByMosqueId = async (mosqueId) => {
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

        // Find mosqueMeeqat by mosque ID
        const mosqueMeeqat = await MosqueMeeqat.findOne({ mosque: mosqueId, isActive: true })
            .populate('mosque', 'name address locality')
            .populate('sourceOfficialMeeqat', 'locationName publisher')
            .populate('generatedBy', 'name email')
            .populate('approvedBy', 'name email');

        if (!mosqueMeeqat) {
            return {
                status: 'success',
                message: 'No mosqueMeeqat found for this mosque',
                mosqueMeeqat: null
            };
        }

        return {
            status: 'success',
            mosqueMeeqat
        };
    } catch (error) {
        console.error('GetMosqueMeeqatByMosqueId error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch mosqueMeeqat'
        };
    }
};

// Generate new mosqueMeeqat
const generateMosqueMeeqat = async (mosqueId, userId, role, assignedMosques) => {
    try {
        // Check mosque access
        if (!checkMosqueAccess(mosqueId, role, assignedMosques)) {
            return {
                status: 'failed',
                code: 403,
                message: 'You do not have access to this mosque'
            };
        }

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

        // Deactivate existing active mosqueMeeqat
        await MosqueMeeqat.updateMany(
            { mosque: mosqueId, isActive: true },
            { isActive: false }
        );

        // Generate timings based on config
        const generatedTimings = generateTimings(
            mosque.officialMeeqat.timings,
            mosque.meeqatConfig
        );

        // Create config snapshot
        const configSnapshot = {
            jamaat: mosque.meeqatConfig.jamaat,
            roundingInterval: mosque.meeqatConfig.roundingInterval,
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
            message: 'MosqueMeeqat generated successfully',
            mosqueMeeqat: newMosqueMeeqat
        };
    } catch (error) {
        console.error('GenerateMosqueMeeqat error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to generate mosqueMeeqat'
        };
    }
};

// Approve mosqueMeeqat
const approveMosqueMeeqat = async (mosqueId, userId, role, assignedMosques) => {
    try {
        // Check mosque access
        if (!checkMosqueAccess(mosqueId, role, assignedMosques)) {
            return {
                status: 'failed',
                code: 403,
                message: 'You do not have access to this mosque'
            };
        }

        // Find active mosqueMeeqat
        const mosqueMeeqat = await MosqueMeeqat.findOne({ mosque: mosqueId, isActive: true });
        if (!mosqueMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active mosqueMeeqat found for this mosque'
            };
        }

        if (mosqueMeeqat.isApproved) {
            return {
                status: 'failed',
                code: 400,
                message: 'MosqueMeeqat is already approved'
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
            message: 'MosqueMeeqat approved successfully',
            mosqueMeeqat
        };
    } catch (error) {
        console.error('ApproveMosqueMeeqat error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to approve mosqueMeeqat'
        };
    }
};

// Update mosqueMeeqat by mosque ID
const updateMosqueMeeqatByMosqueId = async (mosqueId, updateData, userId, role, assignedMosques) => {
    try {
        // Check mosque access
        if (!checkMosqueAccess(mosqueId, role, assignedMosques)) {
            return {
                status: 'failed',
                code: 403,
                message: 'You do not have access to this mosque'
            };
        }

        // Find active mosqueMeeqat
        const mosqueMeeqat = await MosqueMeeqat.findOne({ mosque: mosqueId, isActive: true });
        if (!mosqueMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active mosqueMeeqat found for this mosque'
            };
        }

        // Handle day-specific updates
        if (updateData.dayNumber && updateData.timingUpdate) {
            const dayIndex = mosqueMeeqat.timings.findIndex(t => t.dayNumber === updateData.dayNumber);
            if (dayIndex === -1) {
                return {
                    status: 'failed',
                    code: 400,
                    message: 'Invalid day number'
                };
            }

            // Update specific day
            Object.assign(mosqueMeeqat.timings[dayIndex], updateData.timingUpdate);
            mosqueMeeqat.timings[dayIndex].isManuallyEdited = true;
            mosqueMeeqat.timings[dayIndex].editedBy = userId;
            mosqueMeeqat.timings[dayIndex].editedAt = new Date();
            mosqueMeeqat.timings[dayIndex].editReason = updateData.editReason || 'Manual adjustment';
        }

        // Increment version
        mosqueMeeqat.version += 1;
        await mosqueMeeqat.save();

        return {
            status: 'success',
            message: 'MosqueMeeqat updated successfully',
            mosqueMeeqat
        };
    } catch (error) {
        console.error('UpdateMosqueMeeqatByMosqueId error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to update mosqueMeeqat'
        };
    }
};

// Delete mosqueMeeqat by mosque ID
const deleteMosqueMeeqatByMosqueId = async (mosqueId, role, assignedMosques) => {
    try {
        // Check mosque access
        if (!checkMosqueAccess(mosqueId, role, assignedMosques)) {
            return {
                status: 'failed',
                code: 403,
                message: 'You do not have access to this mosque'
            };
        }

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
        const mosqueMeeqat = await MosqueMeeqat.findOne({ mosque: mosqueId, isActive: true });
        if (!mosqueMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'No active mosqueMeeqat found for this mosque'
            };
        }

        // Remove mosque reference
        await Mosque.findByIdAndUpdate(
            mosqueId,
            { $unset: { mosqueMeeqat: 1 } }
        );

        // Deactivate instead of delete (to preserve history)
        // mosqueMeeqat.isActive = false;
        // await mosqueMeeqat.save();

        // Remove the document from the collection permanently
        const hi = await MosqueMeeqat.deleteOne({ _id: mosqueMeeqat._id });
        console.log('Delete result:', hi);
        return {
            status: 'success',
            message: 'MosqueMeeqat deactivated successfully'
        };
    } catch (error) {
        console.error('DeleteMosqueMeeqatByMosqueId error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to delete mosqueMeeqat'
        };
    }
};

module.exports = {
    getMosqueMeeqatByMosqueId,
    generateMosqueMeeqat,
    approveMosqueMeeqat,
    updateMosqueMeeqatByMosqueId,
    deleteMosqueMeeqatByMosqueId
};