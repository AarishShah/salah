const { formatTime } = require('../dateTimeHelpers');

// Generate HTML content
const generateHTML = async (schedule, mosque) => {
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>${mosque.name} Prayer Schedule</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        // Continuing htmlExportHelper.js
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .friday { background-color: #e6f3ff; }
        .special { background-color: #ffe6e6; }
        .special-events { 
            margin-top: 10px; 
            font-size: 0.9em; 
            color: #666; 
        }
        .mosque-header {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        @media print {
            .mosque-header { background-color: transparent; }
        }
    </style>
</head>
<body>
    <div class="mosque-header">
        <h1>${mosque.name}</h1>
        <h2>${mosque.locality}</h2>
        <h3>Prayer Schedule</h3>
    </div>
    <table>
        <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Fajr</th>
            <th>Sunrise</th>
            <th>Dhuhr/Jummah</th>
            <th>Asr</th>
            <th>Maghrib</th>
            <th>Isha</th>
            <th>Special Events</th>
        </tr>`;
    
    for (const day of schedule) {
        const date = new Date(day.date);
        const dateStr = date.toLocaleDateString('en-US');
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const rowClass = day.dayType === 'friday' ? 'friday' : day.dayType === 'special' ? 'special' : '';
        
        html += `<tr class="${rowClass}">`;
        html += `<td>${dateStr}</td>`;
        html += `<td>${dayName}</td>`;
        html += `<td>${formatTime(day.fajr.jamaatTime)}</td>`;
        html += `<td>${formatTime(day.sunrise.startTime)}</td>`;
        
        if (day.dayType === 'friday' && day.jummah) {
            html += `<td><strong>${formatTime(day.jummah.jamaatTime)}</strong><br><small>Khutbah: ${formatTime(day.jummah.khutbahStartTime)}</small></td>`;
        } else {
            html += `<td>${formatTime(day.dhuhr.jamaatTime)}</td>`;
        }
        
        html += `<td>${formatTime(day.asr.jamaatTime)}</td>`;
        html += `<td>${formatTime(day.maghrib.jamaatTime)}</td>`;
        html += `<td>${formatTime(day.isha.jamaatTime)}</td>`;
        
        // Special events column
        html += '<td>';
        if (day.specialEvents && day.specialEvents.length > 0) {
            html += '<div class="special-events">';
            for (const event of day.specialEvents) {
                html += `<strong>${event.customEventName || event.eventType}</strong><br>`;
                for (const timing of event.timings) {
                    html += `${timing.label}: ${timing.time}<br>`;
                }
                if (event.notes) {
                    html += `<small>${event.notes}</small><br>`;
                }
            }
            html += '</div>';
        } else {
            html += '-';
        }
        html += '</td>';
        
        html += '</tr>';
    }
    
    html += `</table>
    <div style="margin-top: 30px; font-size: 0.8em; color: #666;">
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Note: Prayer times are subject to change. Please verify with the mosque for important events.</p>
    </div>
</body>
</html>`;
    
    return html;
};

module.exports = generateHTML;