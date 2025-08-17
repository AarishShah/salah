const { convertMinutesToDate, getDateFromDayNumber, getDayOfYear } = require('./dateTimeHelpers');

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
        
        // For Dec 31, use