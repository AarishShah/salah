const mongoose = require('mongoose');

const dailyTimingSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },

    // Prayer times
    prayers: {
        fajr: { type: String, required: true },
        sunrise: { type: String, required: true }, // From base CSV
        dhuhr: { type: String, required: true },
        asr: { type: String, required: true },
        maghrib: { type: String, required: true },
        isha: { type: String, required: true }
    },

    // Adhan times
    adhanTimes: {
        fajr: { type: String, required: true },
        dhuhr: { type: String, required: true },
        asr: { type: String, required: true },
        maghrib: { type: String, required: true },
        isha: { type: String, required: true }
    },

    // Manual edit tracking
    isManuallyEdited: { type: Boolean, default: false },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: Date,
    editReason: String
}, { _id: false });

const prayerTimingSchema = new mongoose.Schema({
    mosque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mosque',
        required: true
    },

    year: {
        type: Number,
        required: true
    },

    // Array of 366 daily timings
    timings: {
        type: [dailyTimingSchema],
        validate: {
            validator: function (v) {
                return v.length <= 366;
            },
            message: 'Cannot have more than 366 days'
        }
    },

    // Reference to config used for generation
    generatedFromConfig: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MosqueTimingConfig',
        required: true
    },

    generatedAt: {
        type: Date,
        default: Date.now
    },

    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Compound index for unique mosque-year combination
prayerTimingSchema.index({ mosque: 1, year: 1 }, { unique: true });
// Index for date queries
prayerTimingSchema.index({ 'timings.date': 1 });

module.exports = mongoose.model('PrayerTiming', prayerTimingSchema);