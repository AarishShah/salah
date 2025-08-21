const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    expoPushToken: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    deviceInfo: {
        platform: String,
        deviceName: String,
        appVersion: String,
        osVersion: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

pushTokenSchema.index({ user: 1, isActive: 1 });

pushTokenSchema.methods.deactivate = function () {
    this.isActive = false;
    return this.save();
};

pushTokenSchema.statics.findActiveTokens = function (userId) {
    return this.find({
        user: userId,
        isActive: true
    }).populate('user', 'name email role');
};

module.exports = mongoose.model('PushToken', pushTokenSchema);
