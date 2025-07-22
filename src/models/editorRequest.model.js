const mongoose = require('mongoose');

const editorRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Mosques they want to manage
    requestedMosques: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mosque',
        required: true
    }],

    // Request details
    reason: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    // Review details
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    reviewNote: String,

    // Prevent duplicate pending requests
    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

// Indexes
editorRequestSchema.index({ status: 1, createdAt: -1 });

// Prevent multiple pending requests from same user
editorRequestSchema.index(
    { userId: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'pending' }
    }
);

module.exports = mongoose.model('EditorRequest', editorRequestSchema);