const { convertMinutesToDate, getDateFromDayNumber } = require('./dateTimeHelpers');

// Helper function to build year schedule
const buildYearSchedule = async (mosque, mosqueMeeqat, specialEvents, year, userId) => {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;
    const schedule = [];

    // Get official meeqat timings
    const officialMeeqat = mosqueMeeqat.sourceOfficialMeeqat;

    for (let dayNum = 1; dayNum <= daysInYear; dayNum++) {
        // Adjust index for mosqueMeeqat/officialMeeqat access
        let meeqatIndex;
        if (isLeapYear) {
            // Leap year: direct mapping
            meeqatIndex = dayNum - 1;
        } else {
            // Non-leap year: need to skip Feb 29 (index 59)
            if (dayNum <= 59) {
                // Jan 1 to Feb 28: direct mapping
                meeqatIndex = dayNum - 1;
            } else {
                // March 1 onwards: skip index 59 (Feb 29)
                meeqatIndex = dayNum; // dayNum 60 maps to index 60 (March 1)
            }
        }

        const date = getDateFromDayNumber(dayNum, year);
        const dayOfWeek = date.getDay();
        const isFriday = dayOfWeek === 5;

        // Get timings from official and mosque meeqat using adjusted index
        const officialDay = officialMeeqat.timings[meeqatIndex];
        const mosqueDay = mosqueMeeqat.timings[meeqatIndex];

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
        // console.log(`Mapped day ${dayNum} for year ${year} to ${date.toDateString()}`)  // For Debugging
    }

    // Calculate isha end times and midnight
    for (let i = 0; i < schedule.length; i++) {
        const currentDay = schedule[i];
        let nextFajrTime;

        if (i === schedule.length - 1) {
            // Last day of year (Dec 31), use Jan 1 of next year
            const jan1NextYear = new Date(year + 1, 0, 1);
            nextFajrTime = convertMinutesToDate(officialMeeqat.timings[0].fajr, jan1NextYear);
        } else {
            // Use next day in schedule
            const nextDay = schedule[i + 1];
            nextFajrTime = nextDay.fajr.startTime;
        }

        currentDay.isha.endTime = nextFajrTime;

        // Calculate midnight
        const ishaMinutes = currentDay.isha.startTime.getHours() * 60 + currentDay.isha.startTime.getMinutes();
        const fajrMinutes = nextFajrTime.getHours() * 60 + nextFajrTime.getMinutes();
        const midnightMinutes = (ishaMinutes + fajrMinutes + (fajrMinutes < ishaMinutes ? 1440 : 0)) / 2;

        currentDay.midnight = convertMinutesToDate(midnightMinutes % 1440, currentDay.date);
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

module.exports = {
    buildYearSchedule
};