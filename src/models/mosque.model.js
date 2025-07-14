const mongoose = require('mongoose');

const mosqueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    locality: {
        type: String,
        required: true,
        index: true
    },
    contactPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Reference to assigned editor (User)
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
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster locality search
mosqueSchema.index({ locality: 1 });

module.exports = mongoose.model('Mosque', mosqueSchema);
