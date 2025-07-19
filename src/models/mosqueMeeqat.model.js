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

    // Prayer times after mosque-specific adjustments
    fajr: { type: String, required: true }, // HH:MM
    sunrise: { type: String, required: true }, // No adjustment, copied from base
    zenith: { type: String, required: true },
    dhuhr: { type: String, required: true },
    asr: { type: String, required: true },
    maghrib: { type: String, required: true },
    isha: { type: String, required: true },

    // Adhan times
    adhanTimes: {
        fajr: { type: String, required: true },
        dhuhr: { type: String, required: true },
        asr: { type: String, required: true },
        maghrib: { type: String, required: true },
        isha: { type: String, required: true }
    },

    // Track manual edits
    isManuallyEdited: { type: Boolean, default: false },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: Date,
    editReason: String
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
            fajr: { delay: Number, fixedTime: String, adhanGap: Number, roundingEnabled: Boolean },
            dhuhr: { delay: Number, fixedTime: String, adhanGap: Number, roundingEnabled: Boolean },
            asr: { delay: Number, fixedTime: String, adhanGap: Number, roundingEnabled: Boolean },
            maghrib: { delay: Number, fixedTime: String, adhanGap: Number, roundingEnabled: Boolean },
            isha: { delay: Number, fixedTime: String, adhanGap: Number, roundingEnabled: Boolean }
        },
        roundingInterval: Number,
        jummah: {
            adhanTime: String,
            khutbahStartTime: String,
            jamaatTime: String
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