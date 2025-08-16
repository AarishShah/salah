// mosqueSchedule.model.js
const mongoose = require('mongoose');

const salahTimeSchema = new mongoose.Schema({
    adhan: { type: Date, required: true },
    jamaat: { type: Date, required: true }
}, { _id: false });

const dailyScheduleSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },

    dayOfWeek: {
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
    },

    // Prayer times in ISO format
    prayers: {
        fajr: salahTimeSchema,
        sunrise: { type: Date, required: true },
        dhuhr: salahTimeSchema,
        asr: salahTimeSchema,
        maghrib: salahTimeSchema,
        isha: salahTimeSchema
    },

    // Special handling for Jummah
    isJummah: { type: Boolean, default: false },
    jummah: {
        adhan: Date,
        khutbahStart: Date,
        jamaat: Date
    },

    // Track source for this day
    sourceDayNumber: { type: Number, min: 1, max: 366 },

    // Track manual edits
    isManuallyEdited: { type: Boolean, default: false },
    editHistory: [{
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: Date,
        editReason: String,
        previousData: mongoose.Schema.Types.Mixed
    }]
}, { _id: false });

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
                return v >= currentYear && v <= currentYear + 5;
            },
            message: 'Year must be between current year and 5 years in future'
        }
    },

    // Source mosqueMeeqat
    sourceMosqueMeeqat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MosqueMeeqat',
        required: true
    },

    // Store mosqueMeeqat version for tracking
    sourceMeeqatVersion: {
        type: Number,
        required: true
    },

    // Generation tracking
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
    },

    // 365 or 366 days of schedules
    schedules: {
        type: [dailyScheduleSchema],
        validate: [
            function (arr) {
                const isLeapYear = this.year % 4 === 0 && (this.year % 100 !== 0 || this.year % 400 === 0);
                const expectedDays = isLeapYear ? 366 : 365;
                return arr.length === expectedDays;
            },
            'Schedules array must match year length (365 or 366 days)'
        ]
    },

    // Active status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
mosqueScheduleSchema.index({ mosque: 1, year: 1 }, { unique: true });
mosqueScheduleSchema.index({ mosque: 1, isActive: 1, year: -1 });
mosqueScheduleSchema.index({ 'schedules.date': 1 }); // For date range queries

// Virtual for checking if schedule is current
mosqueScheduleSchema.virtual('isCurrent').get(function () {
    const currentYear = new Date().getFullYear();
    return this.year === currentYear;
});

// Virtual for checking if schedule is for future
mosqueScheduleSchema.virtual('isFuture').get(function () {
    const currentYear = new Date().getFullYear();
    return this.year > currentYear;
});

module.exports = mongoose.model('MosqueSchedule', mosqueScheduleSchema);