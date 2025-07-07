const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Google Authentication
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  
  // Authentication Provider
  authProvider: {
    type: String,
    default: 'google',
    enum: ['google']
  },

  // Optional phone for profile (not for auth)
  phone: {
    type: String,
    trim: true,
    sparse: true // Allows null/undefined values while maintaining uniqueness
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
userSchema.index({ email: 1, isActive: 1 });
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

// Method to clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function() {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > new Date());
};

module.exports = mongoose.model('User', userSchema);