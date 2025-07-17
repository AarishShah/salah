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
    // Remove when possible TODO @Aarish 
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    // GeoJSON location for geospatial queries
    location: {
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
// 2dsphere index for geospatial queries
mosqueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Mosque', mosqueSchema);
