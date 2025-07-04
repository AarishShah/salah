const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // Basic Information
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },

  language: {
    type: String,
    enum: ['en', 'ur'],
    required: true,
    default: 'en'
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['user', 'editor', 'admin'],
    default: 'user'
  },
  
  // For editors - which mosques they can edit
  assignedMosques: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MosqueTimingConfig'
  }],
  
  // OTP Management
  otp: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
    lastSentAt: Date
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: String,
  
  // Tokens
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    deviceInfo: String
  }],
  
  // Metadata
  lastLoginAt: Date,
  loginCount: { type: Number, default: 0 }
  
}, {
  timestamps: true
});

// Indexes
userSchema.index({ phone: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Virtual for permissions based on role
userSchema.virtual('permissions').get(function() {
  const rolePermissions = {
    user: ['timing:read'],
    editor: ['timing:read', 'timing:edit', 'config:edit'],
    admin: ['timing:read', 'timing:edit', 'config:edit', 'editor:manage', 'user:manage']
  };
  return rolePermissions[this.role] || [];
});

// Method to check if user can edit a specific mosque
userSchema.methods.canEditMosque = function(mosqueId) {
  if (this.role === 'admin') return true;
  if (this.role === 'editor') {
    return this.assignedMosques.some(id => id.toString() === mosqueId.toString());
  }
  return false;
};

// Method to clean expired OTPs
userSchema.methods.cleanExpiredOtp = function() {
  if (this.otp && this.otp.expiresAt && this.otp.expiresAt < new Date()) {
    this.otp = undefined;
  }
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const code = crypto.randomInt(100000, 1000000).toString();
  this.otp = {
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0,
    lastSentAt: new Date()
  };
  return code;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(inputOtp) {
  if (!this.otp || !this.otp.code) return false;
  if (this.otp.expiresAt < new Date()) return false;
  if (this.otp.attempts >= 3) return false;
  
  if (this.otp.code === inputOtp) {
    this.otp = undefined; // Clear OTP after successful verification
    return true;
  }
  
  this.otp.attempts += 1;
  return false;
};

module.exports = mongoose.model('User', userSchema);