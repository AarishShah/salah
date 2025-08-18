const { formatTime } = require('../dateTimeHelpers');

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

module.exports = generateCSV;