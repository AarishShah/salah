const mongoose = require('mongoose');

const dailyTimingSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    fajr: { type: String, required: true }, // HH:MM
    sunrise: { type: String, required: true },
    dhuhr: { type: String, required: true },
    asr: { type: String, required: true },
    maghrib: { type: String, required: true },
    isha: { type: String, required: true }
}, { _id: false });

const baseTimingSchema = new mongoose.Schema({
    timings: {
        type: [dailyTimingSchema],
        validate: [arr => arr.length === 366, 'Timings array must have 366 entries']
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BaseTiming', baseTimingSchema); 