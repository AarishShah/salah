const mongoose = require('mongoose');

const prayerTimingSchema = new mongoose.Schema({
    prayer: { type: String, enum: ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'], required: true },
    adhanTime: { type: String, required: true }, // HH:MM format
    jamaatTime: { type: String, required: true }, // HH:MM format
    isManuallyEdited: { type: Boolean, default: false },
    editHistory: [{
        previousAdhanTime: String,
        previousJamaatTime: String,
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        editedAt: { type: Date, default: Date.now },
        reason: String
    }]
});

const mosqueGeneratedTimingSchema = new mongoose.Schema({
    // Reference to mosque configuration
    mosqueId: { type: mongoose.Schema.Types.ObjectId, ref: 'MosqueTimingConfig', required: true },

    // Date information
    date: { type: Date, required: true },
    year: { type: Number, required: true },
    month: { type: Number, min: 1, max: 12, required: true },
    dayOfMonth: { type: Number, min: 1, max: 31, required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday, 5 = Friday

    // Prayer timings
    timings: [prayerTimingSchema],

    // Special timings (like Jummah)
    specialTimings: {
        isJummah: { type: Boolean, default: false },
        jummahTimings: {
            adhanTime: String,
            khutbahTime: String,
            jamaatTime: String
        },
        specialOccasion: String
    },

    // Generation metadata
    generationInfo: {
        method: { type: String, enum: ['auto-generated', 'manual-entry', 'bulk-import'], default: 'auto-generated' },
        generatedAt: { type: Date, default: Date.now },
        generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        basedOnConfig: { type: mongoose.Schema.Types.ObjectId, ref: 'MosqueTimingConfig' }
    },

    // Validation status
    status: {
        type: String,
        enum: ['pending-review', 'approved', 'needs-correction'],
        default: 'pending-review'
    },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    reviewedAt: Date,
    reviewNotes: String

}, {
    timestamps: true
});

// Indexes for efficient queries
mosqueGeneratedTimingSchema.index({ mosqueId: 1, date: 1 }, { unique: true });
mosqueGeneratedTimingSchema.index({ mosqueId: 1, year: 1, month: 1 });
mosqueGeneratedTimingSchema.index({ mosqueId: 1, dayOfWeek: 1 });
mosqueGeneratedTimingSchema.index({ 'timings.isManuallyEdited': 1 });

// Instance method to update a specific prayer timing
mosqueGeneratedTimingSchema.methods.updatePrayerTiming = function (prayerName, newAdhanTime, newJamaatTime, editedBy, reason) {
    const timing = this.timings.find(t => t.prayer === prayerName);
    if (!timing) return false;

    timing.editHistory.push({
        previousAdhanTime: timing.adhanTime,
        previousJamaatTime: timing.jamaatTime,
        editedBy,
        reason
    });

    timing.adhanTime = newAdhanTime;
    timing.jamaatTime = newJamaatTime;
    timing.isManuallyEdited = true;

    return true;
};

// Instance method to get timing for specific prayer
mosqueGeneratedTimingSchema.methods.getPrayerTiming = function (prayerName) {
    return this.timings.find(t => t.prayer === prayerName);
};

// Virtual for checking if any timing was edited
mosqueGeneratedTimingSchema.virtual('hasManualEdits').get(function () {
    return this.timings.some(t => t.isManuallyEdited);
});

module.exports = mongoose.model('MosqueGeneratedTiming', mosqueGeneratedTimingSchema);