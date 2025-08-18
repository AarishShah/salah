const mongoose = require('mongoose');

// Schema for special event timings within a day
const dailySpecialEventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        enum: ['eid-al-fitr', 'eid-al-adha', 'shab-e-qadr', 'shab-e-barat', 'shab-e-miraj', 'laylat-al-qadr', 'custom'],
        required: true
    },
    customEventName: String,
    timings: [{
        eventName: String,
        time: Date
    }],
    notes: String
}, { _id: false });

// Schema for each day's schedule
const dailyScheduleSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },

    dayNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 366
    },

    // Fajr times
    fajr: {
        startTime: { type: Date, required: true },
        adhanTime: { type: Date, required: true },
        jamaatTime: { type: Date, required: true },
        endTime: { type: Date, required: true } // sunrise start
    },

    // Sunrise times
    sunrise: {
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true } // sunrise + 20 min
    },

    // Zenith times
    zenith: {
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true } // zenith + 10 min
    },

    // Dhuhr times (always present, even on Fridays)
    dhuhr: {
        startTime: { type: Date, required: true },
        adhanTime: Date, // null on Fridays
        jamaatTime: Date, // null on Fridays
        endTime: { type: Date, required: true } // asr start
    },

    // Jummah times (only on Fridays)
    jummah: {
        adhanTime: Date, // same as dhuhr start on Fridays
        khutbahStartTime: Date,
        jamaatTime: Date
    },

    // Asr times
    asr: {
        startTime: { type: Date, required: true },
        adhanTime: { type: Date, required: true },
        jamaatTime: { type: Date, required: true },
        endTime: { type: Date, required: true } // 20 min before maghrib
    },

    // Sunset times
    sunset: {
        startTime: { type: Date, required: true }, // 20 min before maghrib
        endTime: { type: Date, required: true } // maghrib start
    },

    // Maghrib times
    maghrib: {
        startTime: { type: Date, required: true },
        adhanTime: { type: Date, required: true },
        jamaatTime: { type: Date, required: true },
        endTime: { type: Date, required: true } // isha start
    },

    // Isha times
    isha: {
        startTime: { type: Date, required: true },
        adhanTime: { type: Date, required: true },
        jamaatTime: { type: Date, required: true },
        endTime: { type: Date, required: true } // next day fajr
    },

    // Midnight calculation
    midnight: {
        type: Date,
        required: true
    },

    // Special events for this day (if any)
    specialEvents: [dailySpecialEventSchema],

    // Day type indicator
    dayType: {
        type: String,
        enum: ['regular', 'friday', 'special'],
        default: 'regular'
    }
}, { _id: false });

// Main Mosque Schedule Schema
const mosqueScheduleSchema = new mongoose.Schema({
    mosque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mosque',
        required: true
    },

    year: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                const currentYear = new Date().getFullYear();
                return v >= currentYear && v <= currentYear + 2;
            },
            message: 'Year must be between current year and 2 years in future'
        }
    },

    // Source references
    sourceMosqueMeeqat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MosqueMeeqat',
        required: true
    },

    sourceOfficialMeeqat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OfficialMeeqat',
        required: true
    },

    // 365/366 days of schedule
    schedule: {
        type: [dailyScheduleSchema],
        validate: {
            validator: function (arr) {
                const isLeapYear = (this.year % 4 === 0 && this.year % 100 !== 0) || (this.year % 400 === 0);
                const expectedDays = isLeapYear ? 366 : 365;
                return arr.length === expectedDays;
            },
            message: 'Schedule array must match the number of days in the year'
        }
    },

    // Generation metadata
    generationType: {
        type: String,
        enum: ['manual', 'automatic'],
        default: 'manual'
    },

    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.generationType === 'manual';
        }
    },

    generatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
mosqueScheduleSchema.index({ mosque: 1, year: 1 }, { unique: true });
mosqueScheduleSchema.index({ mosque: 1, year: -1 });
mosqueScheduleSchema.index({ 'schedule.date': 1 });
mosqueScheduleSchema.index({ 'schedule.dayType': 1 });
mosqueScheduleSchema.index({ 'schedule.specialEvents.eventType': 1 });

module.exports = mongoose.model('MosqueSchedule', mosqueScheduleSchema);