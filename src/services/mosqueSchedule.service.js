const MosqueSchedule = require('../models/mosqueSchedule.model');
const Mosque = require('../models/mosque.model');
const MosqueMeeqat = require('../models/mosqueMeeqat.model');
const OfficialMeeqat = require('../models/officialMeeqat.model');
const MosqueSpecialEvent = require('../models/mosqueSpecialEvent.model');

// Import helpers
const { getDayOfYear } = require('../helpers/mosqueSchedule/dateTimeHelpers');
const { buildYearSchedule } = require('../helpers/mosqueSchedule/scheduleBuilderHelpers');
const generateCSV = require('../helpers/mosqueSchedule/csvExportHelper');
const generateICS = require('../helpers/mosqueSchedule/icsExportHelper');
const generateHTML = require('../helpers/mosqueSchedule/htmlExportHelper');

// Get schedule with date range filtering
const getScheduleByDateRange = async (mosqueId, startDate, endDate) => {
    try {
        const currentYear = new Date().getFullYear();
        
        // Default date range to current year if not provided
        if (!startDate || !endDate) {
            startDate = new Date(`${currentYear}-01-01`);
            endDate = new Date(`${currentYear}-12-31`);
        } else {
            startDate = new Date(startDate);
            endDate = new Date(endDate);
        }

        // Find schedule for the requested year
        const requestedYear = startDate.getFullYear();
        
        const schedule = await MosqueSchedule.findOne({
            mosque: mosqueId,
            year: requestedYear
        });

        if (!schedule) {
            // If schedule doesn't exist, return default current year range
            return {
                status: 'success',
                message: 'No schedule found for requested period',
                dateRange: {
                    startDate: new Date(`${currentYear}-01-01`),
                    endDate: new Date(`${currentYear}-12-31`)
                },
                schedule: []
            };
        }

        // Filter schedule days within date range
        const filteredSchedule = schedule.schedule.filter(day => {
            const dayDate = new Date(day.date);
            return dayDate >= startDate && dayDate <= endDate;
        });

        return {
            status: 'success',
            dateRange: { startDate, endDate },
            mosque: mosqueId,
            year: schedule.year,
            totalDays: filteredSchedule.length,
            schedule: filteredSchedule
        };

    } catch (error) {
        console.error('GetScheduleByDateRange error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch schedule'
        };
    }
};

// Download schedule in various formats
const downloadSchedule = async (mosqueId, startDate, endDate, fileFormat, userId) => {
    try {
        // Get schedule data first
        const scheduleData = await getScheduleByDateRange(mosqueId, startDate, endDate, userId);
        
        if (scheduleData.status === 'failed') {
            return scheduleData;
        }

        // Get mosque details
        const mosque = await Mosque.findById(mosqueId).select('name locality');
        
        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        let content, contentType, filename;
        const baseFilename = `${mosque.name.replace(/\s+/g, '_')}_schedule_${scheduleData.year}`;

        switch (fileFormat.toLowerCase()) {
            case 'csv':
                content = await generateCSV(scheduleData.schedule, mosque);
                contentType = 'text/csv';
                filename = `${baseFilename}.csv`;
                break;
                
            case 'json':
                content = JSON.stringify(scheduleData, null, 2);
                contentType = 'application/json';
                filename = `${baseFilename}.json`;
                break;
                
            case 'ics':
                content = await generateICS(scheduleData.schedule, mosque);
                contentType = 'text/calendar';
                filename = `${baseFilename}.ics`;
                break;
                
            case 'html':
                content = await generateHTML(scheduleData.schedule, mosque);
                contentType = 'text/html';
                filename = `${baseFilename}.html`;
                break;
                
            default:
                return {
                    status: 'failed',
                    code: 400,
                    message: 'Invalid file format. Supported formats: csv, json, ics, html'
                };
        }

        return {
            status: 'success',
            data: content,
            contentType,
            filename
        };

    } catch (error) {
        console.error('DownloadSchedule error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to generate download'
        };
    }
};

// Get all schedules for a mosque (minimal data, paginated)
const getAllSchedules = async (mosqueId, filters, userId) => {
    try {
        const { page, limit, year, generationType } = filters;
        const skip = (page - 1) * limit;

        // Build query
        const query = { mosque: mosqueId };
        if (year) query.year = parseInt(year);
        if (generationType) query.generationType = generationType;

        // Get minimal data
        const schedules = await MosqueSchedule.find(query)
            .select('year generationType generatedBy generatedAt createdAt updatedAt')
            .populate('generatedBy', 'name email')
            .sort({ year: -1 })
            .skip(skip)
            .limit(limit);

        const total = await MosqueSchedule.countDocuments(query);

        return {
            status: 'success',
            schedules,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalDocuments: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };

    } catch (error) {
        console.error('GetAllSchedules error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch schedules'
        };
    }
};

// Get full schedule document by ID
const getScheduleById = async (mosqueId, scheduleId, userId) => {
    try {
        const schedule = await MosqueSchedule.findOne({
            _id: scheduleId,
            mosque: mosqueId
        })
        .populate('mosque', 'name address locality')
        .populate('generatedBy', 'name email')
        .populate('sourceMosqueMeeqat')
        .populate('sourceOfficialMeeqat');

        if (!schedule) {
            return {
                status: 'failed',
                code: 404,
                message: 'Schedule not found'
            };
        }

        return {
            status: 'success',
            schedule
        };

    } catch (error) {
        console.error('GetScheduleById error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch schedule'
        };
    }
};

// Generate new schedule
const generateSchedule = async (mosqueId, year, userId) => {
    try {
        const currentYear = new Date().getFullYear();
        
        // Validate year range
        if (year < currentYear || year > currentYear + 2) {
            return {
                status: 'failed',
                code: 400,
                message: 'Year must be between current year and 2 years in future'
            };
        }

        // Check if schedule already exists
        const existingSchedule = await MosqueSchedule.findOne({ mosque: mosqueId, year });
        if (existingSchedule) {
            return {
                status: 'failed',
                code: 409,
                message: 'Schedule already exists for this year'
            };
        }

        // Get mosque with all references
        const mosque = await Mosque.findById(mosqueId)
            .populate('officialMeeqat')
            .populate('mosqueMeeqat')
            .populate('meeqatConfig');

        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        // Validate required references
        if (!mosque.officialMeeqat || !mosque.meeqatConfig || !mosque.mosqueMeeqat) {
            return {
                status: 'failed',
                code: 400,
                message: 'Mosque missing required configurations (officialMeeqat, meeqatConfig, mosqueMeeqat)'
            };
        }

        // Get mosque meeqat with config snapshot
        const mosqueMeeqat = await MosqueMeeqat.findById(mosque.mosqueMeeqat)
            .populate('sourceOfficialMeeqat');

        // Get special events for the year (if exists)
        let specialEvents = null;
        if (mosque.mosqueSpecialEvents && mosque.mosqueSpecialEvents.length > 0) {
            specialEvents = await MosqueSpecialEvent.findOne({
                mosque: mosqueId,
                year: year
            });
        }

        // Generate schedule
        const scheduleData = await buildYearSchedule(
            mosque,
            mosqueMeeqat,
            specialEvents,
            year,
            userId
        );

        // Check if we need to delete oldest schedule (3-year sliding window)
        const existingSchedules = await MosqueSchedule.find({ mosque: mosqueId })
            .sort({ year: 1 })
            .select('_id year');

        if (existingSchedules.length >= 3) {
            const oldestSchedule = existingSchedules[0];
            await MosqueSchedule.findByIdAndDelete(oldestSchedule._id);
            
            // Update mosque reference
            await Mosque.findByIdAndUpdate(mosqueId, {
                $pull: { mosqueSchedule: oldestSchedule._id }
            });
        }

        // Create new schedule
        const newSchedule = new MosqueSchedule(scheduleData);
        await newSchedule.save();

        // Update mosque reference
        await Mosque.findByIdAndUpdate(mosqueId, {
            $push: { mosqueSchedule: newSchedule._id }
        });

        return {
            status: 'success',
            message: 'Schedule generated successfully',
            scheduleId: newSchedule._id,
            year: newSchedule.year
        };

    } catch (error) {
        console.error('GenerateSchedule error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to generate schedule'
        };
    }
};

// Update special events in existing schedule
const updateSpecialEvents = async (scheduleId, userId) => {
    try {
        const schedule = await MosqueSchedule.findById(scheduleId);
        
        if (!schedule) {
            return {
                status: 'failed',
                code: 404,
                message: 'Schedule not found'
            };
        }

        // Get latest special events for the mosque and year
        const specialEvents = await MosqueSpecialEvent.findOne({
            mosque: schedule.mosque,
            year: schedule.year
        });

        if (!specialEvents || specialEvents.events.length === 0) {
            return {
                status: 'success',
                message: 'No special events to update'
            };
        }

        // Update schedule with new special events
        for (const event of specialEvents.events) {
            const eventDate = new Date(event.date);
            const dayOfYear = getDayOfYear(eventDate);
            
            // Find the corresponding day in schedule
            const scheduleDay = schedule.schedule.find(day => day.dayNumber === dayOfYear);
            
            if (scheduleDay) {
                // Clear existing special events for this day
                scheduleDay.specialEvents = [];
                
                // Add updated event
                scheduleDay.specialEvents.push({
                    eventType: event.eventType,
                    customEventName: event.customEventName,
                    timings: event.timings,
                    notes: event.notes
                });
                
                // Update day type if it has special events
                if (scheduleDay.dayType === 'regular') {
                    scheduleDay.dayType = 'special';
                }
            }
        }

        schedule.updatedAt = new Date();
        await schedule.save();

        return {
            status: 'success',
            message: 'Special events updated successfully'
        };

    } catch (error) {
        console.error('UpdateSpecialEvents error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to update special events'
        };
    }
};

// Delete schedule
const deleteSchedule = async (scheduleId, userId) => {
    try {
        const schedule = await MosqueSchedule.findById(scheduleId);
        
        if (!schedule) {
            return {
                status: 'failed',
                code: 404,
                message: 'Schedule not found'
            };
        }

        // Delete the schedule
        await MosqueSchedule.findByIdAndDelete(scheduleId);

        // Update mosque reference
        await Mosque.findByIdAndUpdate(schedule.mosque, {
            $pull: { mosqueSchedule: scheduleId }
        });

        return {
            status: 'success',
            message: 'Schedule deleted successfully'
        };

    } catch (error) {
        console.error('DeleteSchedule error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to delete schedule'
        };
    }
};

module.exports = {
    getScheduleByDateRange,
    downloadSchedule,
    getAllSchedules,
    getScheduleById,
    generateSchedule,
    updateSpecialEvents,
    deleteSchedule
};