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
    // Remove when possible TODO @Aarish 
    // coordinates: {
    //     latitude: { type: Number },
    //     longitude: { type: Number }
    // },
    // GeoJSON location for geospatial queries
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
    meeqatConfig: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeeqatConfig',
        default: null
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
mosqueSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Mosque', mosqueSchema);
