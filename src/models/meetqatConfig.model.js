const mongoose = require('mongoose');

const prayerConfigSchema = new mongoose.Schema({
    delay: {
        type: Number,
        default: 0,
        min: -120,
        max: 120
    }, // in minutes
    fixedTime: {
        type: String,
        default: null,
        validate: {
            validator: function (v) {
                if (!v) return true;
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Fixed time must be in HH:MM format'
        }
    }, // HH:MM format
    adhanGap: {
        type: Number,
        default: 10,
        min: 0,
        max: 30
    }, // minutes before prayer
    roundingEnabled: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const mosqueTimingConfigSchema = new mongoose.Schema({
    mosque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mosque',
        required: true,
        unique: true
    },

    // Prayer configurations
    prayers: {
        fajr: { type: prayerConfigSchema, default: () => ({}) },
        dhuhr: { type: prayerConfigSchema, default: () => ({}) },
        asr: { type: prayerConfigSchema, default: () => ({}) },
        maghrib: { type: prayerConfigSchema, default: () => ({}) },
        isha: { type: prayerConfigSchema, default: () => ({}) }
    },

    // Global rounding interval (5, 10, or 15 minutes)
    roundingInterval: {
        type: Number,
        enum: [5, 10, 15],
        default: 5
    },

    // Jummah (Friday) prayer settings
    jummah: {
        adhanTime: {
            type: String,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Time must be in HH:MM format'
            }
        },
        khutbahStartTime: String,
        prayerTime: String
    },

    // Metadata
    isActive: { type: Boolean, default: true },
    lastGeneratedAt: Date,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster lookups
mosqueTimingConfigSchema.index({ mosque: 1 });

module.exports = mongoose.model('MosqueTimingConfig', mosqueTimingConfigSchema);