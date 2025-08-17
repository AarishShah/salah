const MosqueSchedule = require('../models/mosqueSchedule.model');
const Mosque = require('../models/mosque.model');
const MosqueMeeqat = require('../models/mosqueMeeqat.model');
const OfficialMeeqat = require('../models/officialMeeqat.model');
const MosqueSpecialEvent = require('../models/mosqueSpecialEvent.model');

// Get schedule with date range filtering
const getScheduleByDateRange = async (mosqueId, startDate, endDate, userId) => {
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

// Helper function to build year schedule
const buildYearSchedule = async (mosque, mosqueMeeqat, specialEvents, year, userId) => {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;
    const schedule = [];

    // Get official meeqat timings
    const officialMeeqat = mosqueMeeqat.sourceOfficialMeeqat;

    for (let dayNum = 1; dayNum <= daysInYear; dayNum++) {
        // Skip Feb 29 if not leap year
        if (!isLeapYear && dayNum === 60) continue;

        const date = getDateFromDayNumber(dayNum, year);
        const dayOfWeek = date.getDay();
        const isFriday = dayOfWeek === 5;

        // Get timings from official and mosque meeqat
        const officialDay = officialMeeqat.timings[dayNum - 1];
        const mosqueDay = mosqueMeeqat.timings[dayNum - 1];

        // Calculate prayer times
        const daySchedule = {
            date: date,
            dayNumber: dayNum,
            dayType: isFriday ? 'friday' : 'regular',
            
            fajr: {
                startTime: convertMinutesToDate(officialDay.fajr, date),
                adhanTime: convertMinutesToDate(mosqueDay.adhanTimes.fajr, date),
                jamaatTime: convertMinutesToDate(mosqueDay.fajr, date),
                endTime: convertMinutesToDate(mosqueDay.sunrise, date)
            },
            
            sunrise: {
                startTime: convertMinutesToDate(mosqueDay.sunrise, date),
                endTime: convertMinutesToDate(mosqueDay.sunrise + 20, date)
            },
            
            zenith: {
                startTime: convertMinutesToDate(mosqueDay.zenith, date),
                endTime: convertMinutesToDate(mosqueDay.zenith + 10, date)
            },
            
            dhuhr: {
                startTime: convertMinutesToDate(officialDay.dhuhr, date),
                adhanTime: isFriday ? null : convertMinutesToDate(mosqueDay.adhanTimes.dhuhr, date),
                jamaatTime: isFriday ? null : convertMinutesToDate(mosqueDay.dhuhr, date),
                endTime: convertMinutesToDate(officialDay.asr, date)
            },
            
            asr: {
                startTime: convertMinutesToDate(officialDay.asr, date),
                adhanTime: convertMinutesToDate(mosqueDay.adhanTimes.asr, date),
                jamaatTime: convertMinutesToDate(mosqueDay.asr, date),
                endTime: convertMinutesToDate(officialDay.maghrib - 20, date)
            },
            
            sunset: {
                startTime: convertMinutesToDate(officialDay.maghrib - 20, date),
                endTime: convertMinutesToDate(officialDay.maghrib, date)
            },
            
            maghrib: {
                startTime: convertMinutesToDate(officialDay.maghrib, date),
                adhanTime: convertMinutesToDate(mosqueDay.adhanTimes.maghrib, date),
                jamaatTime: convertMinutesToDate(mosqueDay.maghrib, date),
                endTime: convertMinutesToDate(officialDay.isha, date)
            },
            
            isha: {
                startTime: convertMinutesToDate(officialDay.isha, date),
                adhanTime: convertMinutesToDate(mosqueDay.adhanTimes.isha, date),
                jamaatTime: convertMinutesToDate(mosqueDay.isha, date),
                endTime: null // Will be set after loop
            },
            
            midnight: null, // Will be calculated
            specialEvents: []
        };

        // Add Jummah times if Friday
        if (isFriday) {
            daySchedule.jummah = {
                adhanTime: convertMinutesToDate(officialDay.dhuhr, date),
                khutbahStartTime: convertMinutesToDate(mosqueMeeqat.configSnapshot.jummah.khutbahStartTime, date),
                jamaatTime: convertMinutesToDate(mosqueMeeqat.configSnapshot.jummah.jamaatTime, date)
            };
        }

        // Add special events if any
        if (specialEvents) {
            const dayEvents = specialEvents.events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.toDateString() === date.toDateString();
            });

            if (dayEvents.length > 0) {
                daySchedule.dayType = 'special';
                daySchedule.specialEvents = dayEvents.map(event => ({
                    eventType: event.eventType,
                    customEventName: event.customEventName,
                    timings: event.timings,
                    notes: event.notes
                }));
            }
        }

        schedule.push(daySchedule);
    }

    // Calculate isha end times and midnight
    for (let i = 0; i < schedule.length; i++) {
        const currentDay = schedule[i];
        const nextDayIndex = (i + 1) % schedule.length;
        const nextDay = schedule[nextDayIndex];
        
        // For Dec 31, use Jan 1 from same year's official meeqat
        const nextFajrTime = nextDay ? nextDay.fajr.startTime : 
            convertMinutesToDate(officialMeeqat.timings[0].fajr, new Date(year + 1, 0, 1));
        
        currentDay.isha.endTime = nextFajrTime;
        
                // Calculate midnight
        const ishaMinutes = currentDay.isha.startTime.getHours() * 60 + currentDay.isha.startTime.getMinutes();
        const fajrMinutes = nextFajrTime.getHours() * 60 + nextFajrTime.getMinutes();
        const midnightMinutes = (ishaMinutes + fajrMinutes + (fajrMinutes < ishaMinutes ? 1440 : 0)) / 2;
        
        currentDay.midnight = convertMinutesToDate(midnightMinutes, currentDay.date);
    }

    return {
        mosque: mosque._id,
        year: year,
        sourceMosqueMeeqat: mosqueMeeqat._id,
        sourceOfficialMeeqat: officialMeeqat._id,
        schedule: schedule,
        generatedBy: userId,
        generationType: 'manual'
    };
};

// Helper Functions

// Convert minutes from midnight to Date object
const convertMinutesToDate = (minutes, baseDate) => {
    const date = new Date(baseDate);
    date.setHours(Math.floor(minutes / 60));
    date.setMinutes(minutes % 60);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
};

// Get day of year from date
const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

// Get date from day number and year
const getDateFromDayNumber = (dayNumber, year) => {
    const date = new Date(year, 0); // January 1st
    date.setDate(dayNumber);
    return date;
};

// Generate CSV content
const generateCSV = async (schedule, mosque) => {
    let csv = `Mosque: ${mosque.name}, Location: ${mosque.locality}\n`;
    csv += 'Date,Day,Fajr Start,Fajr Adhan,Fajr Jamaat,Sunrise,Dhuhr Start,Dhuhr Adhan,Dhuhr Jamaat,Asr Start,Asr Adhan,Asr Jamaat,Maghrib Start,Maghrib Adhan,Maghrib Jamaat,Isha Start,Isha Adhan,Isha Jamaat\n';
    
    for (const day of schedule) {
        const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = new Date(day.date).toLocaleDateString('en-US');
        
        csv += `${dateStr},${dayName},`;
        csv += `${formatTime(day.fajr.startTime)},${formatTime(day.fajr.adhanTime)},${formatTime(day.fajr.jamaatTime)},`;
        csv += `${formatTime(day.sunrise.startTime)},`;
        
        if (day.dayType === 'friday' && day.jummah) {
            csv += `${formatTime(day.dhuhr.startTime)},${formatTime(day.jummah.adhanTime)},${formatTime(day.jummah.jamaatTime)},`;
        } else {
            csv += `${formatTime(day.dhuhr.startTime)},${formatTime(day.dhuhr.adhanTime)},${formatTime(day.dhuhr.jamaatTime)},`;
        }
        
        csv += `${formatTime(day.asr.startTime)},${formatTime(day.asr.adhanTime)},${formatTime(day.asr.jamaatTime)},`;
        csv += `${formatTime(day.maghrib.startTime)},${formatTime(day.maghrib.adhanTime)},${formatTime(day.maghrib.jamaatTime)},`;
        csv += `${formatTime(day.isha.startTime)},${formatTime(day.isha.adhanTime)},${formatTime(day.isha.jamaatTime)}\n`;
    }
    
    return csv;
};

// Generate ICS content
const generateICS = async (schedule, mosque) => {
    let ics = 'BEGIN:VCALENDAR\n';
    ics += 'VERSION:2.0\n';
    ics += `PRODID:-//Mosque Prayer Times//EN\n`;
    ics += `X-WR-CALNAME:${mosque.name} Prayer Times\n`;
    
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    for (const day of schedule) {
        for (const prayer of prayers) {
            if (day[prayer] && day[prayer].jamaatTime) {
                const uid = `${day.date}-${prayer}@mosque.com`;
                const startTime = new Date(day[prayer].jamaatTime);
                const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes duration
                
                ics += 'BEGIN:VEVENT\n';
                ics += `UID:${uid}\n`;
                ics += `DTSTART:${formatICSDate(startTime)}\n`;
                ics += `DTEND:${formatICSDate(endTime)}\n`;
                ics += `SUMMARY:${prayer.charAt(0).toUpperCase() + prayer.slice(1)} Prayer\n`;
                ics += `LOCATION:${mosque.name}, ${mosque.locality}\n`;
                ics += 'END:VEVENT\n';
            }
        }
    }
    
    ics += 'END:VCALENDAR';
    return ics;
};

// Generate HTML content
const generateHTML = async (schedule, mosque) => {
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>${mosque.name} Prayer Schedule</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .friday { background-color: #e6f3ff; }
        .special { background-color: #ffe6e6; }
    </style>
</head>
<body>
    <h1>${mosque.name} - ${mosque.locality}</h1>
    <h2>Prayer Schedule</h2>
    <table>
        <tr>
            <th>Date</th>
            <th>Fajr</th>
            <th>Sunrise</th>
            <th>Dhuhr/Jummah</th>
            <th>Asr</th>
            <th>Maghrib</th>
            <th>Isha</th>
        </tr>`;
    
    for (const day of schedule) {
        const dateStr = new Date(day.date).toLocaleDateString('en-US');
        const rowClass = day.dayType === 'friday' ? 'friday' : day.dayType === 'special' ? 'special' : '';
        
        html += `<tr class="${rowClass}">`;
        html += `<td>${dateStr}</td>`;
        html += `<td>${formatTime(day.fajr.jamaatTime)}</td>`;
        html += `<td>${formatTime(day.sunrise.startTime)}</td>`;
        
        if (day.dayType === 'friday' && day.jummah) {
            html += `<td>${formatTime(day.jummah.jamaatTime)} (J)</td>`;
        } else {
            html += `<td>${formatTime(day.dhuhr.jamaatTime)}</td>`;
        }
        
        html += `<td>${formatTime(day.asr.jamaatTime)}</td>`;
        html += `<td>${formatTime(day.maghrib.jamaatTime)}</td>`;
        html += `<td>${formatTime(day.isha.jamaatTime)}</td>`;
        html += '</tr>';
    }
    
    html += '</table></body></html>';
    return html;
};

// Format time helper
const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
};

// Format ICS date
const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
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