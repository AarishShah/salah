const mongoose = require('mongoose');

const scheduledNotificationSchema = new mongoose.Schema({
    // Mosque this notification is for
    mosque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mosque',
        required: true
    },

    // Editor who created this notification
    editor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Notification content
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    body: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    // Additional data to include in notification
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Notification settings
    sound: {
        type: String,
        default: 'default',
        enum: ['default', 'none']
    },

    priority: {
        type: String,
        default: 'normal',
        enum: ['normal', 'high']
    },

    // When to send the notification
    scheduledFor: {
        type: Date,
        required: true
    },

    // Status tracking
    status: {
        type: String,
        enum: ['scheduled', 'sent', 'failed', 'cancelled'],
        default: 'scheduled'
    },

    // When it was actually sent (if successful)
    sentAt: {
        type: Date
    },

    // Error message if failed
    errorMessage: {
        type: String
    },

    // Results of sending
    results: {
        sent: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
scheduledNotificationSchema.index({ scheduledFor: 1, status: 1 });
scheduledNotificationSchema.index({ mosque: 1, status: 1 });
scheduledNotificationSchema.index({ editor: 1, status: 1 });

// Virtual to check if notification is ready to send
scheduledNotificationSchema.virtual('isReadyToSend').get(function () {
    return this.status === 'scheduled' && this.scheduledFor <= new Date();
});

// Method to mark as sent
scheduledNotificationSchema.methods.markAsSent = function (results) {
    this.status = 'sent';
    this.sentAt = new Date();
    if (results) {
        this.results = results;
    }
    return this.save();
};

// Method to mark as failed
scheduledNotificationSchema.methods.markAsFailed = function (errorMessage) {
    this.status = 'failed';
    this.errorMessage = errorMessage;
    return this.save();
};

// Method to cancel
scheduledNotificationSchema.methods.cancel = function () {
    this.status = 'cancelled';
    return this.save();
};

module.exports = mongoose.model('ScheduledNotification', scheduledNotificationSchema);

