const mongoose = require('mongoose');

const eventTimingSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    }
}, { _id: false });

const specialEventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        enum: ['eid-al-fitr', 'eid-al-adha', 'shab-e-qadr', 'shab-e-barat', 'shab-e-miraj', 'laylat-al-qadr', 'custom'],
        required: true
    },
    
    customEventName: {
        type: String,
        required: function() {
            return this.eventType === 'custom';
        }
    },
    
    date: {
        type: Date,
        required: true
    },
    
    // Flexible timing structure for different events
    timings: {
        type: [eventTimingSchema],
        validate: {
            validator: function(arr) {
                return arr.length <= 5;
            },
            message: 'Maximum 5 timings allowed per event'
        }
    },
    
    // Additional notes or instructions for this specific event
    notes: String
}, { _id: true }); // Keep _id for individual event tracking

const mosqueSpecialEventSchema = new mongoose.Schema({
    mosque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mosque',
        required: true
    },
    
    year: {
        type: Number,
        required: true,
        validate: {
            validator: function(v) {
                const currentYear = new Date().getFullYear();
                return v >= currentYear && v <= currentYear + 2;
            },
            message: 'Year must be between current year and 2 years in future'
        }
    },
    
    // Array of events for this year (max 10)
    events: {
        type: [specialEventSchema],
        validate: [
            {
                validator: function(arr) {
                    return arr.length <= 10;
                },
                message: 'Maximum 10 special events allowed per year'
            }
        ],
        default: []
    },
    
    // Tracking
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    lastModifiedAt: Date
}, {
    timestamps: true
});

// Indexes
mosqueSpecialEventSchema.index({ mosque: 1, year: 1 }, { unique: true }); // One document per mosque per year
mosqueSpecialEventSchema.index({ mosque: 1, year: -1 });
mosqueSpecialEventSchema.index({ 'events.date': 1 });
mosqueSpecialEventSchema.index({ 'events.eventType': 1 });

module.exports = mongoose.model('MosqueSpecialEvent', mosqueSpecialEventSchema);