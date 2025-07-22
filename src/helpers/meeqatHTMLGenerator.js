const generateMeeqatHTML = (mosqueMeeqat, filters) => {
    const { timings, mosque, configSnapshot } = mosqueMeeqat;
    const currentYear = filters.year || new Date().getFullYear();
    const currentMonth = filters.month;

    // Group timings by month
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const timingsByMonth = {};
    
    timings.forEach(day => {
        const monthName = day.date_csv.split('-')[1];
        if (!timingsByMonth[monthName]) {
            timingsByMonth[monthName] = [];
        }
        timingsByMonth[monthName].push(day);
    });

    // Generate month tables
    const generateMonthTable = (monthName, days) => {
        return `
            <div class="month-container">
                <h2>${monthName} ${currentYear}</h2>
                <table class="prayer-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th colspan="2">Fajr</th>
                            <th>Sunrise</th>
                            <th colspan="2">Dhuhr</th>
                            <th colspan="2">Asr</th>
                            <th colspan="2">Maghrib</th>
                            <th colspan="2">Isha</th>
                        </tr>
                        <tr class="sub-header">
                            <th></th>
                            <th>Adhan</th>
                            <th>Jamaat</th>
                            <th></th>
                            <th>Adhan</th>
                            <th>Jamaat</th>
                            <th>Adhan</th>
                            <th>Jamaat</th>
                            <th>Adhan</th>
                            <th>Jamaat</th>
                            <th>Adhan</th>
                            <th>Jamaat</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${days.map(day => `
                            <tr class="${day.isManuallyEdited ? 'edited' : ''}">
                                <td class="date-cell">${day.date_csv}</td>
                                <td>${day.adhanTimes.fajr}</td>
                                <td class="jamaat-time">${day.fajr}</td>
                                <td>${day.sunrise}</td>
                                <td>${day.adhanTimes.dhuhr}</td>
                                <td class="jamaat-time">${day.dhuhr}</td>
                                <td>${day.adhanTimes.asr}</td>
                                <td class="jamaat-time">${day.asr}</td>
                                <td>${day.adhanTimes.maghrib}</td>
                                <td class="jamaat-time">${day.maghrib}</td>
                                <td>${day.adhanTimes.isha}</td>
                                <td class="jamaat-time">${day.isha}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    // Generate Jummah info if available
    const jummahInfo = configSnapshot.jummah ? `
        <div class="jummah-info">
            <h3>Jummah (Friday) Prayer</h3>
            <table class="jummah-table">
                <tr>
                    <td><strong>Adhan:</strong></td>
                    <td>${configSnapshot.jummah.adhanTime || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Khutbah:</strong></td>
                    <td>${configSnapshot.jummah.khutbahStartTime || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Jamaat:</strong></td>
                    <td>${configSnapshot.jummah.jamaatTime || 'N/A'}</td>
                </tr>
            </table>
        </div>
    ` : '';

    // Build the complete HTML
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${mosque.name} - Prayer Timetable ${currentYear}</title>
            <style>
                ${getStyles()}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${mosque.name}</h1>
                    <p>Prayer Timetable - ${currentYear}</p>
                </div>
                
                <div class="mosque-info">
                    <p><strong>Address:</strong> ${mosque.address || 'N/A'}</p>
                    <p><strong>Locality:</strong> ${mosque.locality || 'N/A'}</p>
                    <p><strong>Source:</strong> ${mosqueMeeqat.sourceOfficialMeeqat?.locationName || 'N/A'} - ${mosqueMeeqat.sourceOfficialMeeqat?.publisher || 'N/A'}</p>
                </div>
                
                <div class="controls no-print">
                    <button class="btn" onclick="window.print()">Print Timetable</button>
                    <a href="?year=${currentYear - 1}" class="btn">Previous Year</a>
                    <a href="?year=${currentYear + 1}" class="btn">Next Year</a>
                </div>
                
                ${jummahInfo}
                
                ${Object.entries(timingsByMonth)
                    .filter(([month]) => !currentMonth || month === currentMonth)
                    .map(([month, days]) => generateMonthTable(month, days))
                    .join('')}
                
                <div class="footer">
                    <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                    <p>${mosqueMeeqat.isApproved ? 'Approved Timetable' : 'Draft Timetable - Pending Approval'}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
};

const getStyles = () => {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #2c3e50;
            color: white;
            border-radius: 10px;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .mosque-info {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .mosque-info p {
            font-size: 1.1em;
            color: #666;
        }
        
        .month-container {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        
        .month-container h2 {
            background-color: #34495e;
            color: white;
            padding: 10px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        
        .prayer-table {
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .prayer-table th {
            background-color: #3498db;
            color: white;
            padding: 10px 5px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #2980b9;
        }
        
        .sub-header th {
            background-color: #5dade2;
            font-size: 0.9em;
            padding: 8px 5px;
        }
        
        .prayer-table td {
            padding: 8px 5px;
            text-align: center;
            border: 1px solid #ddd;
            background-color: white;
        }
        
        .prayer-table tr:nth-child(even) td {
            background-color: #f9f9f9;
        }
        
        .prayer-table tr:hover td {
            background-color: #e8f4f8;
        }
        
        .date-cell {
            font-weight: bold;
            background-color: #ecf0f1 !important;
        }
        
        .jamaat-time {
            font-weight: bold;
            color: #2c3e50;
            background-color: #e8f6ff !important;
        }
        
        .edited {
            background-color: #fff3cd !important;
        }
        
        .jummah-info {
            margin: 30px 0;
            padding: 20px;
            background-color: #e8f4f8;
            border-radius: 10px;
            text-align: center;
        }
        
        .jummah-table {
            margin: 10px auto;
            border-collapse: collapse;
        }
        
        .jummah-table td {
            padding: 8px 20px;
            border: 1px solid #3498db;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        
        @media print {
            body {
                background-color: white;
            }
            
            .container {
                max-width: 100%;
                padding: 0;
            }
            
            .header {
                background-color: white;
                color: black;
                border: 2px solid black;
            }
            
            .month-container {
                page-break-inside: avoid;
            }
            
            .prayer-table th {
                background-color: #ddd !important;
                color: black !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .no-print {
                display: none;
            }
        }
        
        .controls {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 5px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            cursor: pointer;
            border: none;
            font-size: 14px;
        }
        
        .btn:hover {
            background-color: #2980b9;
        }
    `;
};

module.exports = generateMeeqatHTML;