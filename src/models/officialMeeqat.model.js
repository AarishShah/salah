const mongoose = require('mongoose');

const dailyTimingSchema = new mongoose.Schema({
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

const officialMeeqatSchema = new mongoose.Schema({
    locationName: {
        type: String,
        required: true,
        trim: true
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: false
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        }
    },
    sect: {
        type: String,
        enum: ['sunni', 'shia'],
        required: true
    },
    schoolOfThought: {
        type: String,
        enum: ['hanafi', 'shafi', 'maliki', 'hanbali'],
        required: function () {
            return this.sect === 'sunni';
        },
        validate: {
            validator: function (v) {
                // If Shia, schoolOfThought should be null/undefined
                if (this.sect === 'shia') return !v;
                // If Sunni, schoolOfThought is required
                if (this.sect === 'sunni') return !!v;
                return true;
            },
            message: 'School of thought is required for Sunni sect only'
        }
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

// For Sunni entries
officialMeeqatSchema.index({ locationName: 1, sect: 1, schoolOfThought: 1 }, { 
    unique: true,
    partialFilterExpression: { sect: 'sunni' }
});

// For Shia entries
officialMeeqatSchema.index({ locationName: 1, sect: 1 }, { 
    unique: true,
    partialFilterExpression: { sect: 'shia' }
});

module.exports = mongoose.model('OfficialMeeqat', officialMeeqatSchema);