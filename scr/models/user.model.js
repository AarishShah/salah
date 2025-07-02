const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^\+91\d{10}$/ // Ensures phone starts with +91 and has 10 digits after
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
    default: 'user'
  },
  language: {
    type: String,
    enum: ['en', 'ur'],
    required: true,
    default: 'en'
  },
  masjidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:
    'Masjid',
    default: null
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', userSchema);