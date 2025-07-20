const mongoose = require('mongoose');

const jamaatConfigSchema = new mongoose.Schema({
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
        max: 90
    }, // minutes before jamaat
    roundingEnabled: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const meeqatConfigSchema = new mongoose.Schema({
    mosque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mosque',
        required: true,
        unique: true
    },

    // jamaat configurations
    jamaat: {
        fajr: { type: jamaatConfigSchema, default: () => ({}) },
        dhuhr: { type: jamaatConfigSchema, default: () => ({}) },
        asr: { type: jamaatConfigSchema, default: () => ({}) },
        maghrib: { type: jamaatConfigSchema, default: () => ({}) },
        isha: { type: jamaatConfigSchema, default: () => ({}) }
    },

    // Global rounding interval (5, 10, or 15 minutes)
    roundingInterval: {
        type: Number,
        enum: [5, 10, 15],
        default: 5
    },

    // Jummah (Friday) salah settings
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
        jamaatTime: String
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
meeqatConfigSchema.index({ mosque: 1 });

module.exports = mongoose.model('MeeqatConfig', meeqatConfigSchema);