const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    baseTiming: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BaseTiming',
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema); 