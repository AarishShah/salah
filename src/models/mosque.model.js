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
        default: null
    },
    // GeoJSON location for geospatial queries
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
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
        required: function() {
            return this.sect === 'sunni';
        },
        validate: {
            validator: function(v) {
                // If Shia, schoolOfThought should be null/undefined
                if (this.sect === 'shia') return !v;
                // If Sunni, schoolOfThought is required
                if (this.sect === 'sunni') return !!v;
                return true;
            },
            message: 'School of thought is required for Sunni sect only'
        }
    },
    officialMeeqat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OfficialMeeqat',
        default: null
    },
    meeqatConfig: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeeqatConfig',
        default: null
    },
    mosqueMeeqat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MosqueMeeqat',
        default: null
    },
    isActive: {
        type: Boolean,
        default: false
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

// Index for faster locality search
mosqueSchema.index({ locality: 1 });
// 2dsphere index for geospatial queries
mosqueSchema.index({ coordinates: '2dsphere' });

mosqueSchema.index({ 'coordinates.coordinates': 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Mosque', mosqueSchema);