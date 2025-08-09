const mongoose = require('mongoose');

const mosqueDailyTimingSchema = new mongoose.Schema({
    date_csv: {
        type: String,
        required: true
    }, // "1-Jan" format as in CSV (no year)

    dayNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 366
    }, // Day of year (1-366)

    // Prayer times after mosque-specific adjustments (minutes from midnight)
    fajr: { type: Number, required: true, min: 0, max: 1439 },
    sunrise: { type: Number, required: true, min: 0, max: 1439 }, // No adjustment, copied from base
    zenith: { type: Number, required: true, min: 0, max: 1439 },
    dhuhr: { type: Number, required: true, min: 0, max: 1439 },
    asr: { type: Number, required: true, min: 0, max: 1439 },
    maghrib: { type: Number, required: true, min: 0, max: 1439 },
    isha: { type: Number, required: true, min: 0, max: 1439 },

    // Adhan times (minutes from midnight)
    adhanTimes: {
        fajr: { type: Number, required: true, min: 0, max: 1439 },
        dhuhr: { type: Number, required: true, min: 0, max: 1439 },
        asr: { type: Number, required: true, min: 0, max: 1439 },
        maghrib: { type: Number, required: true, min: 0, max: 1439 },
        isha: { type: Number, required: true, min: 0, max: 1439 }
    },

    // Track manual edits
    isManuallyEdited: { type: Boolean, default: false },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: Date,
    editReason: String
}, { _id: false });

const jamaatConfigSnapshotSchema = new mongoose.Schema({
    delay: {
        type: Number,
        default: 0,
        min: -120,
        max: 120
    },
    fixedTime: {
        type: Number,
        default: null,
        min: 0,
        max: 1439
    },
    adhanGap: {
        type: Number,
        default: 10,
        min: 0,
        max: 90
    },
    roundingInterval: {
        type: Number,
        enum: [0, 5, 10, 15],
        default: 5
    }
}, { _id: false });

const mosqueMeeqatSchema = new mongoose.Schema({
    mosque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mosque',
        required: true,
        unique: true
    },

    // Source official meeqat used
    sourceOfficialMeeqat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OfficialMeeqat',
        required: true
    },

    // Configuration snapshot used for generation
    configSnapshot: {
        jamaat: {
            fajr: { type: jamaatConfigSnapshotSchema, default: () => ({}) },
            dhuhr: { type: jamaatConfigSnapshotSchema, default: () => ({}) },
            asr: { type: jamaatConfigSnapshotSchema, default: () => ({}) },
            maghrib: { type: jamaatConfigSnapshotSchema, default: () => ({}) },
            isha: { type: jamaatConfigSnapshotSchema, default: () => ({}) }
        },
        jummah: {
            adhanTime: {
                type: Number,
                min: 0,
                max: 1439
            },
            khutbahStartTime: {
                type: Number,
                min: 0,
                max: 1439
            },
            jamaatTime: {
                type: Number,
                min: 0,
                max: 1439
            }
        }
    },

    // 366 days of customized timings
    timings: {
        type: [mosqueDailyTimingSchema],
        validate: [arr => arr.length === 366, 'Timings array must have 366 entries']
    },

    // Metadata
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },

    // Editor approval
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,

    // Version tracking
    version: {
        type: Number,
        default: 1
    },

    // Active status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
mosqueMeeqatSchema.index({ mosque: 1, isActive: 1 });
mosqueMeeqatSchema.index({ mosque: 1, version: -1 });

// Methods
mosqueMeeqatSchema.methods.incrementVersion = function () {
    this.version += 1;
    return this.save();
};

module.exports = mongoose.model('MosqueMeeqat', mosqueMeeqatSchema);