const mongoose = require('mongoose');

const prayerScheduleSchema = new mongoose.Schema({
  name: { type: String, enum: ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'], required: true },
  adhanOffset: { type: Number, default: 0 }, // in seconds
  adhanToJamatDuration: { type: Number, required: true }, // minutes between adhan and jamat
  roundOff: {
    enabled: { type: Boolean, default: false },
    direction: { type: String, enum: ['up', 'down', 'nearest'], default: 'nearest' },
    interval: { type: Number, default: 5 } // in minutes (5, 10, 15) 
  }
});

const seasonalAdjustmentSchema = new mongoose.Schema({
  prayer: { type: String, enum: ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'], required: true },
  hasSeasonalChanges: { type: Boolean, default: false },
  adjustments: [{
    season: { type: String, enum: ['summer', 'winter'], required: true },
    startDate: { month: { type: Number, min: 1, max: 12 }, day: { type: Number, min: 1, max: 31 } },
    offsetSeconds: { type: Number, required: true },// positive or negative seconds
  }]
});

const  mosqueTimingConfigSchema = new mongoose.Schema({
  // Section 1: Mosque Information
  mosqueInfo: {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true }, locality: {
      type: String, required: true, index: true
    },
    contactPerson: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, lowercase: true, trim: true }
    },
    coordinates: { latitude: Number, longitude: Number },
    sect: { type: String, enum: ['sunni-hanafi', 'sunni-shafi', 'sunni-maliki', 'sunni-hanbali', 'shia'], required: true }
  },

  // Section 2: Prayer Timing Method
  timingMethod: { type: String, enum: ['community-standard', 'fixed-delay', 'own-calculation'], required: true },

  // Section 3: Daily Prayer Schedule
  dailySchedule: [prayerScheduleSchema],

  // Section 4: Seasonal Adjustments
  seasonalAdjustments: [seasonalAdjustmentSchema],

  // Section 5: Special Considerations // change to data later
  specialConsiderations: {
    jummah: {
      adhanTime: String, // Store as HH:MM format
      khutbahStartTime: String,
      prayerTime: String
    }
  },

  // Section 6: Technical Details
  technicalDetails: {
    updateFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'never'], required: true }
  },

  // Metadata
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, {
  timestamps: true
});

// Indexes for better query performance
 mosqueTimingConfigSchema.index({ 'mosqueInfo.locality': 1, isActive: 1 });
 mosqueTimingConfigSchema.index({ 'mosqueInfo.coordinates': '2dsphere' }); // For geospatial queries

// Virtual for full mosque details
 mosqueTimingConfigSchema.virtual('fullName').get(function ()
{
  return `${this.mosqueInfo.name}, ${this.mosqueInfo.locality}`;
});

// Method to get prayer time for a specific prayer
 mosqueTimingConfigSchema.methods.getPrayerSchedule = function (prayerName)
{
  return this.dailySchedule.find(schedule => schedule.name === prayerName);
};

// Method to check if mosque has seasonal adjustments
 mosqueTimingConfigSchema.methods.hasSeasonalAdjustments = function ()
{
  return this.seasonalAdjustments.some(adj => adj.hasSeasonalChanges);
};

// Pre-save middleware to ensure all 5 prayers are in dailySchedule
 mosqueTimingConfigSchema.pre('save', function (next)
{
  const prayers = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];
  const existingPrayers = this.dailySchedule.map(s => s.name);

  prayers.forEach(prayer =>
  {
    if (!existingPrayers.includes(prayer))
    {
      this.dailySchedule.push({
        name: prayer,
        adhanOffset: 0,
        adhanToJamatDuration: 15,
        roundOff: { enabled: false }
      });
    }
  });

  next();
});

module.exports = mongoose.model('MosqueTimingConfig',  mosqueTimingConfigSchema);