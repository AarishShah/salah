const generateMosqueMeeqatHTML = (mosqueMeeqat, dateRange, timeFormat) => {
    const { mosque, sourceOfficialMeeqat, timings, version, generatedAt, isApproved } = mosqueMeeqat;
    
    // Generate timing rows
    const timingRows = timings.map(timing => `
        <tr>
            <td>${timing.date_csv}</td>
            <td class="day-number">${timing.dayNumber}</td>
            <td class="prayer-time fajr">${timing.fajr}</td>
            <td class="prayer-time sunrise">${timing.sunrise}</td>
            <td class="prayer-time dhuhr">${timing.dhuhr}</td>
            <td class="prayer-time asr">${timing.asr}</td>
            <td class="prayer-time maghrib">${timing.maghrib}</td>
            <td class="prayer-time isha">${timing.isha}</td>
            <td class="adhan-time">${timing.adhanTimes.fajr}</td>
            <td class="adhan-time">${timing.adhanTimes.dhuhr}</td>
            <td class="adhan-time">${timing.adhanTimes.asr}</td>
            <td class="adhan-time">${timing.adhanTimes.maghrib}</td>
            <td class="adhan-time">${timing.adhanTimes.isha}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prayer Timetable - ${mosque.name}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #2c3e50;
                padding-bottom: 20px;
            }
            .mosque-name {
                color: #2c3e50;
                font-size: 28px;
                margin: 0;
                font-weight: bold;
            }
            .mosque-details {
                color: #666;
                margin: 10px 0;
                font-size: 16px;
            }
            .info-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
            }
            .info-item {
                margin: 5px 0;
            }
            .info-label {
                font-weight: bold;
                color: #2c3e50;
            }
            .timetable {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-size: 14px;
            }
            .timetable th {
                background-color: #2c3e50;
                color: white;
                padding: 12px 8px;
                text-align: center;
                font-weight: bold;
            }
            .timetable td {
                padding: 10px 8px;
                text-align: center;
                border-bottom: 1px solid #ddd;
            }
            .timetable tbody tr:hover {
                background-color: #f1f1f1;
            }
            .prayer-time {
                font-weight: bold;
                color: #27ae60;
            }
            .adhan-time {
                color: #e67e22;
                font-size: 12px;
            }
            .day-number {
                color: #666;
                font-size: 12px;
            }
            .status {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .approved {
                background-color: #d4edda;
                color: #155724;
            }
            .pending {
                background-color: #fff3cd;
                color: #856404;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #ddd;
                padding-top: 15px;
            }
            @media (max-width: 768px) {
                .container {
                    margin: 10px;
                    padding: 15px;
                }
                .timetable {
                    font-size: 12px;
                }
                .timetable th,
                .timetable td {
                    padding: 6px 4px;
                }
                .mosque-name {
                    font-size: 22px;
                }
                .info-section {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="mosque-name">${mosque.name}</h1>
                <div class="mosque-details">
                    📍 ${mosque.address}, ${mosque.locality}
                </div>
                <span class="status ${isApproved ? 'approved' : 'pending'}">
                    ${isApproved ? 'Approved' : 'Pending Approval'}
                </span>
            </div>

            <div class="info-section">
                <div>
                    <div class="info-item">
                        <span class="info-label">Source:</span> ${sourceOfficialMeeqat.locationName}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Publisher:</span> ${sourceOfficialMeeqat.publisher}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date Range:</span> ${dateRange.startDate} to ${dateRange.endDate}
                    </div>
                </div>
                <div>
                    <div class="info-item">
                        <span class="info-label">Version:</span> ${version}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Time Format:</span> ${timeFormat}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Days:</span> ${dateRange.totalDays}
                    </div>
                </div>
            </div>

            <table class="timetable">
                <thead>
                    <tr>
                        <th rowspan="2">Date</th>
                        <th rowspan="2">Day#</th>
                        <th colspan="6">Prayer Times</th>
                        <th colspan="5">Adhan Times</th>
                    </tr>
                    <tr>
                        <th>Fajr</th>
                        <th>Sunrise</th>
                        <th>Dhuhr</th>
                        <th>Asr</th>
                        <th>Maghrib</th>
                        <th>Isha</th>
                        <th>Fajr</th>
                        <th>Dhuhr</th>
                        <th>Asr</th>
                        <th>Maghrib</th>
                        <th>Isha</th>
                    </tr>
                </thead>
                <tbody>
                    ${timingRows}
                </tbody>
            </table>

            <div class="footer">
                <p>Generated on ${new Date(generatedAt).toLocaleDateString()}</p>
                <p>🕌 Prayer times are calculated according to ${sourceOfficialMeeqat.sect} methodology</p>
            </div>
        </div>
    </body>
    </html>`;
};

module.exports = {
    generateMosqueMeeqatHTML
};