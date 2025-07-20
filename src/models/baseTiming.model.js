// rename to officialMeeqat

const mongoose = require('mongoose');

const dailyTimingSchema = new mongoose.Schema({
    date: { type: Date, required: true }, // remove and do not use
    date_csv: { type: String, required: true }, // "1-Jan" format from CSV
    dayNumber: { type: Number, required: true, min: 1, max: 366 }, // Day of year
    fajr: { type: String, required: true }, // HH:MM
    sunrise: { type: String, required: true },
    zenith: { type: String, required: true },
    dhuhr: { type: String, required: true },
    asr: { type: String, required: true },
    maghrib: { type: String, required: true },
    isha: { type: String, required: true }
}, { _id: false });

const baseTimingSchema = new mongoose.Schema({
    locationName: {
        type: String,
        required: true,
        trim: true
    },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    sect: {
        type: String,
        enum: ['sunni-hanafi', 'sunni-shafi', 'sunni-maliki', 'sunni-hanbali', 'shia'],
        required: true
    },
    publisher: {
        type: String,
        required: true,
        trim: true
    },
    timings: {
        type: [dailyTimingSchema],
        validate: [arr => arr.length === 366, 'Timings array must have 366 entries']
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

// Add compound index for location + sect uniqueness
baseTimingSchema.index({ locationName: 1, sect: 1 }, { unique: true });
module.exports = mongoose.model('BaseTiming', baseTimingSchema);