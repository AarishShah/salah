const mongoose = require('mongoose');

const dailyTimingSchema = new mongoose.Schema({
    date_csv: { type: String, required: true }, // "1-Jan" format from CSV
    dayNumber: { type: Number, required: true }, // Day of year (1-366)
    fajr: { type: Number, required: true, min: 0, max: 1439 }, // Minutes from midnight (0-1439)
    sunrise: { type: Number, required: true, min: 0, max: 1439 },
    zenith: { type: Number, required: true, min: 0, max: 1439 },
    dhuhr: { type: Number, required: true, min: 0, max: 1439 },
    asr: { type: Number, required: true, min: 0, max: 1439 },
    maghrib: { type: Number, required: true, min: 0, max: 1439 },
    isha: { type: Number, required: true, min: 0, max: 1439 }
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
        enum: [
            // Sunni schools
            'hanafi', 'shafi', 'maliki', 'hanbali',
            // Shia schools
            'jafari', 'ismaili', 'zaydi'
        ],
        required: true,
        validate: {
            validator: function (v) {
                const sunniSchools = ['hanafi', 'shafi', 'maliki', 'hanbali'];
                const shiaSchools = ['jafari', 'ismaili', 'zaydi'];
                
                if (this.sect === 'sunni') {
                    return sunniSchools.includes(v);
                }
                if (this.sect === 'shia') {
                    return shiaSchools.includes(v);
                }
                return false;
            },
            message: 'Invalid school of thought for the selected sect'
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

officialMeeqatSchema.index({ locationName: 1, sect: 1, schoolOfThought: 1 }, { 
    unique: true
});

module.exports = mongoose.model('OfficialMeeqat', officialMeeqatSchema);