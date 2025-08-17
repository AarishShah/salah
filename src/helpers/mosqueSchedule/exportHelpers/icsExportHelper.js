const { formatICSDate } = require('../dateTimeHelpers');

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
        
        // Add Jummah prayer for Fridays
        if (day.dayType === 'friday' && day.jummah && day.jummah.jamaatTime) {
            const uid = `${day.date}-jummah@mosque.com`;
            const startTime = new Date(day.jummah.jamaatTime);
            const endTime = new Date(startTime.getTime() + 45 * 60000); // 45 minutes duration
            
            ics += 'BEGIN:VEVENT\n';
            ics += `UID:${uid}\n`;
            ics += `DTSTART:${formatICSDate(startTime)}\n`;
            ics += `DTEND:${formatICSDate(endTime)}\n`;
            ics += `SUMMARY:Jummah Prayer\n`;
            ics += `LOCATION:${mosque.name}, ${mosque.locality}\n`;
            ics += 'END:VEVENT\n';
        }
        
        // Add special events
        if (day.specialEvents && day.specialEvents.length > 0) {
            for (const event of day.specialEvents) {
                for (const timing of event.timings) {
                    const uid = `${day.date}-${event.eventType}-${timing.label}@mosque.com`;
                    const eventTime = new Date(day.date);
                    const [hours, minutes] = timing.time.split(':');
                    eventTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    const endTime = new Date(eventTime.getTime() + 60 * 60000); // 1 hour duration
                    
                    ics += 'BEGIN:VEVENT\n';
                    ics += `UID:${uid}\n`;
                    ics += `DTSTART:${formatICSDate(eventTime)}\n`;
                    ics += `DTEND:${formatICSDate(endTime)}\n`;
                    ics += `SUMMARY:${event.customEventName || event.eventType} - ${timing.label}\n`;
                    ics += `LOCATION:${mosque.name}, ${mosque.locality}\n`;
                    if (event.notes) {
                        ics += `DESCRIPTION:${event.notes}\n`;
                    }
                    ics += 'END:VEVENT\n';
                }
            }
        }
    }
    
    ics += 'END:VCALENDAR';
    return ics;
};

module.exports = generateICS;