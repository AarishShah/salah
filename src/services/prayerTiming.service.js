const PrayerTiming = require('../models/prayerTiming.model');
const moment = require('moment');

const getMosqueTimings = async (mosqueId, filters = {}) => {
  try {
    const { year, month, startDate, endDate } = filters;
    
    // Build query
    const query = { mosque: mosqueId };
    
    if (year) {
      query.year = parseInt(year);
    } else {
      query.year = new Date().getFullYear();
    }
    
    const prayerTiming = await PrayerTiming.findOne(query)
      .populate('generatedBy', 'name email')
      .populate('mosque', 'name address');
    
    if (!prayerTiming) {
      return {
        status: 'failed',
        code: 404,
        message: 'Prayer timings not found for this mosque'
      };
    }
    
    let timings = [...prayerTiming.timings];
    
    // Apply filters
    if (month) {
      const monthNum = parseInt(month) - 1; // 0-indexed
      timings = timings.filter(t => 
        new Date(t.date).getMonth() === monthNum
      );
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      timings = timings.filter(t => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });
    }
    
    return {
      status: 'success',
      mosque: prayerTiming.mosque,
      year: prayerTiming.year,
      generatedAt: prayerTiming.generatedAt,
      generatedBy: prayerTiming.generatedBy,
      totalDays: timings.length,
      timings
    };
  } catch (error) {
    console.error('GetMosqueTimings error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to fetch mosque timings'
    };
  }
};

const getTimingByDate = async (mosqueId, date) => {
  try {
    const searchDate = new Date(date);
    const year = searchDate.getFullYear();
    
    const prayerTiming = await PrayerTiming.findOne({
      mosque: mosqueId,
      year
    });
    
    if (!prayerTiming) {
      return {
        status: 'failed',
        code: 404,
        message: 'Prayer timings not found'
      };
    }
    
    // Find specific date
    const timing = prayerTiming.timings.find(t => 
      moment(t.date).format('YYYY-MM-DD') === moment(searchDate).format('YYYY-MM-DD')
    );
    
    if (!timing) {
      return {
        status: 'failed',
        code: 404,
        message: 'Timing not found for this date'
      };
    }
    
    return {
      status: 'success',
      timing
    };
  } catch (error) {
    console.error('GetTimingByDate error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to fetch timing'
    };
  }
};

const getMonthlyView = async (mosqueId, year, month) => {
  try {
    const prayerTiming = await PrayerTiming.findOne({
      mosque: mosqueId,
      year
    }).populate('mosque', 'name address');
    
    if (!prayerTiming) {
      return {
        status: 'failed',
        code: 404,
        message: 'Prayer timings not found'
      };
    }
    
    // Filter for specific month
    const monthNum = month - 1; // 0-indexed
    const monthTimings = prayerTiming.timings.filter(t => 
      new Date(t.date).getMonth() === monthNum
    );
    
    // Group by week for calendar view
    const weeks = [];
    let currentWeek = [];
    
    monthTimings.forEach(timing => {
      const dayOfWeek = new Date(timing.date).getDay();
      
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push({
        date: timing.date,
        dayOfWeek,
        prayers: timing.prayers,
        adhanTimes: timing.adhanTimes,
        isManuallyEdited: timing.isManuallyEdited
      });
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return {
      status: 'success',
      mosque: prayerTiming.mosque,
      year,
      month,
      weeks,
      totalDays: monthTimings.length
    };
  } catch (error) {
    console.error('GetMonthlyView error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to fetch monthly view'
    };
  }
};

const updateSpecificDate = async (mosqueId, date, updateData, userId) => {
  try {
    const searchDate = new Date(date);
    const year = searchDate.getFullYear();
    
    const prayerTiming = await PrayerTiming.findOne({
      mosque: mosqueId,
      year
    });
    
    if (!prayerTiming) {
      return {
        status: 'failed',
        code: 404,
        message: 'Prayer timings not found'
      };
    }
    
    // Find and update specific date
    const timingIndex = prayerTiming.timings.findIndex(t => 
      moment(t.date).format('YYYY-MM-DD') === moment(searchDate).format('YYYY-MM-DD')
    );
    
    if (timingIndex === -1) {
      return {
        status: 'failed',
        code: 404,
        message: 'Timing not found for this date'
      };
    }
    
    // Validate update data
    const { prayers, adhanTimes, reason } = updateData;
    
    if (!prayers || !adhanTimes) {
      return {
        status: 'failed',
        code: 400,
        message: 'Both prayers and adhanTimes are required'
      };
    }
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    for (const prayer of prayerNames) {
      if (prayers[prayer] && !timeRegex.test(prayers[prayer])) {
        return {
          status: 'failed',
          code: 400,
          message: `Invalid time format for ${prayer} prayer`
        };
      }
      if (adhanTimes[prayer] && !timeRegex.test(adhanTimes[prayer])) {
        return {
          status: 'failed',
          code: 400,
          message: `Invalid time format for ${prayer} adhan`
        };
      }
    }
    
    // Update the timing
    prayerTiming.timings[timingIndex] = {
      ...prayerTiming.timings[timingIndex],
      date: prayerTiming.timings[timingIndex].date, // explicitly preserve date
      prayers: {
        ...prayerTiming.timings[timingIndex].prayers,
        ...prayers
      },
      adhanTimes: {
        ...prayerTiming.timings[timingIndex].adhanTimes,
        ...adhanTimes
      },
      isManuallyEdited: true,
      editedBy: userId,
      editedAt: new Date(),
      editReason: reason || 'Manual adjustment'
    };
    
    await prayerTiming.save();
    
    return {
      status: 'success',
      message: 'Timing updated successfully',
      timing: prayerTiming.timings[timingIndex]
    };
  } catch (error) {
    console.error('UpdateSpecificDate error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to update timing'
    };
  }
};

// Helper function to get today's timing for a mosque
const getTodayTiming = async (mosqueId) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    
    const prayerTiming = await PrayerTiming.findOne({
      mosque: mosqueId,
      year
    });
    
    if (!prayerTiming) {
      return {
        status: 'failed',
        code: 404,
        message: 'Prayer timings not found'
      };
    }
    
    const todayTiming = prayerTiming.timings.find(t => 
      moment(t.date).format('YYYY-MM-DD') === moment(today).format('YYYY-MM-DD')
    );
    
    if (!todayTiming) {
      return {
        status: 'failed',
        code: 404,
        message: 'No timing found for today'
      };
    }
    
    // Add next prayer calculation
    const now = moment();
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    let nextPrayer = null;
    let nextPrayerTime = null;
    
    for (const prayer of prayers) {
      const prayerTime = moment(
        `${moment(todayTiming.date).format('YYYY-MM-DD')} ${todayTiming.prayers[prayer]}`,
        'YYYY-MM-DD HH:mm'
      );
      
      if (prayerTime.isAfter(now)) {
        nextPrayer = prayer;
        nextPrayerTime = prayerTime;
        break;
      }
    }
    
    return {
      status: 'success',
      timing: todayTiming,
      nextPrayer: nextPrayer ? {
        name: nextPrayer,
        time: todayTiming.prayers[nextPrayer],
        adhanTime: todayTiming.adhanTimes[nextPrayer],
        timeUntil: nextPrayerTime.fromNow()
      } : null
    };
  } catch (error) {
    console.error('GetTodayTiming error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to fetch today\'s timing'
    };
  }
};

// Get timing differences between base and mosque times
const getTimingComparison = async (mosqueId, date) => {
  try {
    const BaseTiming = require('../models/baseTiming.model');
    const searchDate = new Date(date);
    const year = searchDate.getFullYear();
    
    // Get mosque timing
    const prayerTiming = await PrayerTiming.findOne({
      mosque: mosqueId,
      year
    });
    
    if (!prayerTiming) {
      return {
        status: 'failed',
        code: 404,
        message: 'Prayer timings not found'
      };
    }
    
    // Get base timing
    const baseTiming = await BaseTiming.findOne({
      date: searchDate,
      year
    });
    
    if (!baseTiming) {
      return {
        status: 'failed',
        code: 404,
        message: 'Base timing not found'
      };
    }
    
    // Find mosque timing for date
    const mosqueTiming = prayerTiming.timings.find(t => 
      moment(t.date).format('YYYY-MM-DD') === moment(searchDate).format('YYYY-MM-DD')
    );
    
    if (!mosqueTiming) {
      return {
        status: 'failed',
        code: 404,
        message: 'Mosque timing not found for this date'
      };
    }
    
    // Calculate differences
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const comparison = {};
    
    prayers.forEach(prayer => {
      const baseMinutes = timeToMinutes(baseTiming[prayer]);
      const mosqueMinutes = timeToMinutes(mosqueTiming.prayers[prayer]);
      const difference = mosqueMinutes - baseMinutes;
      
      comparison[prayer] = {
        baseTime: baseTiming[prayer],
        mosqueTime: mosqueTiming.prayers[prayer],
        difference: difference,
        differenceFormatted: `${difference >= 0 ? '+' : ''}${difference} min`
      };
    });
    
    return {
      status: 'success',
      date: searchDate,
      comparison,
      isManuallyEdited: mosqueTiming.isManuallyEdited
    };
  } catch (error) {
    console.error('GetTimingComparison error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to get timing comparison'
    };
  }
};

// Helper function to convert time string to minutes
const timeToMinutes = (timeStr) => {
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + mins;
};

module.exports = {
  getMosqueTimings,
  getTimingByDate,
  getMonthlyView,
  updateSpecificDate,
  getTodayTiming,
  getTimingComparison
};