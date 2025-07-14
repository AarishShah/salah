const MosqueTimingConfig = require('../models/mosqueTimingConfig.model');
const PrayerTiming = require('../models/prayerTiming.model');
const BaseTiming = require('../models/baseTiming.model');

// Helper function to add/subtract minutes from time string
const adjustTime = (timeStr, minutes) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;

    let newHours = Math.floor(totalMinutes / 60);
    let newMins = totalMinutes % 60;

    // Handle negative minutes
    if (newMins < 0) {
        newMins += 60;
        newHours -= 1;
    }

    // Handle day overflow
    newHours = ((newHours % 24) + 24) % 24;

    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};

// Round time based on interval and direction
const roundTime = (timeStr, interval, direction) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins;

    let roundedMinutes;
    if (direction === 'up') {
        roundedMinutes = Math.ceil(totalMinutes / interval) * interval;
    } else if (direction === 'down') {
        roundedMinutes = Math.floor(totalMinutes / interval) * interval;
    } else { // nearest
        roundedMinutes = Math.round(totalMinutes / interval) * interval;
    }

    const newHours = Math.floor(roundedMinutes / 60) % 24;
    const newMins = roundedMinutes % 60;

    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};

// Detect trend by comparing with previous days
const detectTrend = (currentTime, previousTime) => {
    if (!previousTime) return 'stable';

    const current = currentTime.split(':').map(Number);
    const previous = previousTime.split(':').map(Number);

    const currentMinutes = current[0] * 60 + current[1];
    const previousMinutes = previous[0] * 60 + previous[1];

    if (currentMinutes > previousMinutes) return 'increasing';
    if (currentMinutes < previousMinutes) return 'decreasing';
    return 'stable';
};

// Calculate prayer time for a specific prayer
const calculatePrayerTime = (baseTime, prayerConfig, roundingInterval, previousTime = null) => {
    // If fixed time is set, use it directly
    if (prayerConfig.fixedTime) {
        return prayerConfig.fixedTime;
    }

    // Apply delay to base time
    let calculatedTime = adjustTime(baseTime, prayerConfig.delay || 0);

    // Apply rounding if enabled
    if (prayerConfig.roundingEnabled && roundingInterval) {
        const trend = detectTrend(calculatedTime, previousTime);

        // Determine rounding direction based on trend
        let direction;
        if (trend === 'increasing') {
            direction = 'down'; // Resist increase
        } else if (trend === 'decreasing') {
            direction = 'up'; // Resist decrease
        } else {
            direction = 'nearest';
        }

        calculatedTime = roundTime(calculatedTime, roundingInterval, direction);
    }

    return calculatedTime;
};

const getConfig = async (mosqueId) => {
    try {
        const config = await MosqueTimingConfig.findOne({
            mosqueId,
            isActive: true
        });

        if (!config) {
            return {
                status: 'failed',
                code: 404,
                message: 'Configuration not found for this mosque'
            };
        }

        return {
            status: 'success',
            config
        };
    } catch (error) {
        console.error('GetConfig error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch configuration'
        };
    }
};

const createOrUpdateConfig = async (mosqueId, configData, userId) => {
    try {
        const config = await MosqueTimingConfig.findOneAndUpdate(
            { mosqueId },
            {
                ...configData,
                mosqueId,
                updatedBy: userId,
                $setOnInsert: { createdBy: userId }
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        return {
            status: 'success',
            message: 'Configuration saved successfully',
            config
        };
    } catch (error) {
        console.error('CreateOrUpdateConfig error:', error);
        return {
            status: 'failed',
            code: 400,
            message: error.message || 'Failed to save configuration'
        };
    }
};

const generateTimings = async (mosqueId, year, userId) => {
    try {
        // Get configuration
        const config = await MosqueTimingConfig.findOne({
            mosqueId,
            isActive: true
        });

        if (!config) {
            return {
                status: 'failed',
                code: 404,
                message: 'Configuration not found'
            };
        }

        // Get base timing document (contains all 366 days)
        const baseTimingDoc = await BaseTiming.findOne().sort({ createdAt: -1 });

        if (!baseTimingDoc || !baseTimingDoc.timings || baseTimingDoc.timings.length === 0) {
            return {
                status: 'failed',
                code: 404,
                message: 'Base timings not found'
            };
        }

        // Filter base timings for the requested year
        const baseTimings = baseTimingDoc.timings.filter(timing => {
            const timingYear = new Date(timing.date).getFullYear();
            return timingYear === year;
        });

        if (baseTimings.length === 0) {
            return {
                status: 'failed',
                code: 404,
                message: `No base timings found for year ${year}`
            };
        }

        // Sort by date
        baseTimings.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Generate mosque timings
        const generatedTimings = [];
        const previousTimes = {};

        for (let i = 0; i < baseTimings.length; i++) {
            const baseDay = baseTimings[i];
            const dayOfWeek = new Date(baseDay.date).getDay();
            const isFriday = dayOfWeek === 5;

            const dailyTiming = {
                date: baseDay.date,
                prayers: {
                    sunrise: baseDay.sunrise // Keep sunrise as-is
                },
                adhanTimes: {}
            };

            // Process each prayer
            const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

            for (const prayer of prayers) {
                const prayerConfig = config.prayers[prayer];

                // Calculate prayer time
                dailyTiming.prayers[prayer] = calculatePrayerTime(
                    baseDay[prayer],
                    prayerConfig,
                    config.roundingInterval,
                    previousTimes[prayer]
                );

                // Update previous time for trend detection
                previousTimes[prayer] = dailyTiming.prayers[prayer];

                // Calculate adhan time
                dailyTiming.adhanTimes[prayer] = adjustTime(
                    dailyTiming.prayers[prayer],
                    -(prayerConfig.adhanGap || 10)
                );
            }

            // Handle Jummah for Fridays
            if (isFriday && config.jummah && config.jummah.prayerTime) {
                dailyTiming.prayers.dhuhr = config.jummah.prayerTime;
                dailyTiming.adhanTimes.dhuhr = config.jummah.adhanTime ||
                    adjustTime(config.jummah.prayerTime, -10);
            }

            generatedTimings.push(dailyTiming);
        }

        // Save generated timings
        const prayerTiming = await PrayerTiming.findOneAndUpdate(
            { mosqueId, year },
            {
                mosqueId,
                year,
                timings: generatedTimings,
                generatedFromConfig: config._id,
                generatedBy: userId,
                generatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        // Update config last generated time
        config.lastGeneratedAt = new Date();
        await config.save();

        return {
            status: 'success',
            message: `Successfully generated ${generatedTimings.length} days of timings for year ${year}`,
            timingId: prayerTiming._id,
            daysGenerated: generatedTimings.length
        };
    } catch (error) {
        console.error('GenerateTimings error:', error);
        return {
            status: 'failed',
            code: 500,
            message: error.message || 'Failed to generate timings'
        };
    }
};

const previewTimings = async (mosqueId, days = 7) => {
    try {
        // Get configuration
        const config = await MosqueTimingConfig.findOne({
            mosqueId,
            isActive: true
        });

        if (!config) {
            return {
                status: 'failed',
                code: 404,
                message: 'Configuration not found'
            };
        }

        // Get base timing document
        const baseTimingDoc = await BaseTiming.findOne().sort({ createdAt: -1 });

        if (!baseTimingDoc || !baseTimingDoc.timings || baseTimingDoc.timings.length === 0) {
            return {
                status: 'failed',
                code: 404,
                message: 'Base timings not found'
            };
        }

        // Get current date and find timings starting from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter and sort base timings from today onwards
        const futureTimings = baseTimingDoc.timings
            .filter(timing => new Date(timing.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, days);

        if (futureTimings.length === 0) {
            // If no future timings, get the most recent ones
            const recentTimings = baseTimingDoc.timings
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, days)
                .reverse();

            futureTimings.push(...recentTimings);
        }

        // Generate preview
        const preview = [];
        const previousTimes = {};

        for (const baseDay of futureTimings) {
            const dayOfWeek = new Date(baseDay.date).getDay();
            const isFriday = dayOfWeek === 5;

            const dayPreview = {
                date: baseDay.date,
                dayName: new Date(baseDay.date).toLocaleDateString('en-US', { weekday: 'long' }),
                prayers: {
                    sunrise: baseDay.sunrise
                },
                adhanTimes: {},
                calculations: {} // Show calculation details
            };

            const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

            for (const prayer of prayers) {
                const prayerConfig = config.prayers[prayer];

                // Show calculation breakdown
                dayPreview.calculations[prayer] = {
                    baseTime: baseDay[prayer],
                    delay: prayerConfig.delay || 0,
                    fixedTime: prayerConfig.fixedTime || null,
                    roundingEnabled: prayerConfig.roundingEnabled,
                    roundingInterval: config.roundingInterval
                };

                // Calculate final time
                dayPreview.prayers[prayer] = calculatePrayerTime(
                    baseDay[prayer],
                    prayerConfig,
                    config.roundingInterval,
                    previousTimes[prayer]
                );

                // Add trend info if rounding is enabled
                if (prayerConfig.roundingEnabled && previousTimes[prayer]) {
                    dayPreview.calculations[prayer].trend = detectTrend(
                        baseDay[prayer],
                        previousTimes[prayer]
                    );
                }

                previousTimes[prayer] = dayPreview.prayers[prayer];

                dayPreview.adhanTimes[prayer] = adjustTime(
                    dayPreview.prayers[prayer],
                    -(prayerConfig.adhanGap || 10)
                );
            }

            // Handle Jummah
            if (isFriday && config.jummah && config.jummah.prayerTime) {
                dayPreview.prayers.dhuhr = config.jummah.prayerTime;
                dayPreview.adhanTimes.dhuhr = config.jummah.adhanTime ||
                    adjustTime(config.jummah.prayerTime, -10);
                dayPreview.calculations.dhuhr.jummahOverride = true;
            }

            preview.push(dayPreview);
        }

        return {
            status: 'success',
            preview,
            daysShown: preview.length,
            config: {
                roundingInterval: config.roundingInterval,
                prayers: config.prayers,
                jummah: config.jummah
            }
        };
    } catch (error) {
        console.error('PreviewTimings error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to generate preview'
        };
    }
};

// Helper function to get a sample of base timings for a specific date range
const getBaseTimingsSample = async (startDate, endDate) => {
    try {
        const baseTimingDoc = await BaseTiming.findOne().sort({ createdAt: -1 });

        if (!baseTimingDoc || !baseTimingDoc.timings) {
            return [];
        }

        return baseTimingDoc.timings.filter(timing => {
            const date = new Date(timing.date);
            return date >= startDate && date <= endDate;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
        console.error('GetBaseTimingsSample error:', error);
        return [];
    }
};

// Validate configuration before saving
const validateConfig = (configData) => {
    const errors = [];

    // Validate prayer configurations
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    if (configData.prayers) {
        prayers.forEach(prayer => {
            const prayerConfig = configData.prayers[prayer];
            if (prayerConfig) {
                // Validate delay
                if (prayerConfig.delay !== undefined) {
                    if (prayerConfig.delay < -120 || prayerConfig.delay > 120) {
                        errors.push(`${prayer} delay must be between -120 and 120 minutes`);
                    }
                }

                // Validate fixed time format
                if (prayerConfig.fixedTime) {
                    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (!timeRegex.test(prayerConfig.fixedTime)) {
                        errors.push(`${prayer} fixed time must be in HH:MM format`);
                    }
                }

                // Validate adhan gap
                if (prayerConfig.adhanGap !== undefined) {
                    if (prayerConfig.adhanGap < 0 || prayerConfig.adhanGap > 30) {
                        errors.push(`${prayer} adhan gap must be between 0 and 30 minutes`);
                    }
                }
            }
        });
    }

    // Validate rounding interval
    if (configData.roundingInterval !== undefined) {
        if (![5, 10, 15].includes(configData.roundingInterval)) {
            errors.push('Rounding interval must be 5, 10, or 15 minutes');
        }
    }

    // Validate Jummah times
    if (configData.jummah) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        if (configData.jummah.adhanTime && !timeRegex.test(configData.jummah.adhanTime)) {
            errors.push('Jummah adhan time must be in HH:MM format');
        }

        if (configData.jummah.khutbahStartTime && !timeRegex.test(configData.jummah.khutbahStartTime)) {
            errors.push('Jummah khutbah start time must be in HH:MM format');
        }

        if (configData.jummah.prayerTime && !timeRegex.test(configData.jummah.prayerTime)) {
            errors.push('Jummah prayer time must be in HH:MM format');
        }

        // Validate logical order
        if (configData.jummah.adhanTime && configData.jummah.khutbahStartTime) {
            const adhanMinutes = timeToMinutes(configData.jummah.adhanTime);
            const khutbahMinutes = timeToMinutes(configData.jummah.khutbahStartTime);

            if (khutbahMinutes <= adhanMinutes) {
                errors.push('Khutbah start time must be after adhan time');
            }
        }

        if (configData.jummah.khutbahStartTime && configData.jummah.prayerTime) {
            const khutbahMinutes = timeToMinutes(configData.jummah.khutbahStartTime);
            const prayerMinutes = timeToMinutes(configData.jummah.prayerTime);

            if (prayerMinutes <= khutbahMinutes) {
                errors.push('Jummah prayer time must be after khutbah start time');
            }
        }
    }

    return errors;
};

// Helper to convert time string to minutes
const timeToMinutes = (timeStr) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    return hours * 60 + mins;
};

// Get config history for a mosque
const getConfigHistory = async (mosqueId) => {
    try {
        const configs = await MosqueTimingConfig.find({ mosqueId })
            .sort({ updatedAt: -1 })
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .limit(10);

        return {
            status: 'success',
            history: configs.map(config => ({
                id: config._id,
                isActive: config.isActive,
                lastGeneratedAt: config.lastGeneratedAt,
                createdBy: config.createdBy,
                updatedBy: config.updatedBy,
                createdAt: config.createdAt,
                updatedAt: config.updatedAt
            }))
        };
    } catch (error) {
        console.error('GetConfigHistory error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch config history'
        };
    }
};

// Duplicate config from one mosque to another
const duplicateConfig = async (sourceMosqueId, targetMosqueId, userId) => {
    try {
        const sourceConfig = await MosqueTimingConfig.findOne({
            mosqueId: sourceMosqueId,
            isActive: true
        });

        if (!sourceConfig) {
            return {
                status: 'failed',
                code: 404,
                message: 'Source mosque configuration not found'
            };
        }

        // Create new config for target mosque
        const newConfig = new MosqueTimingConfig({
            mosqueId: targetMosqueId,
            prayers: sourceConfig.prayers,
            roundingInterval: sourceConfig.roundingInterval,
            jummah: sourceConfig.jummah,
            isActive: true,
            createdBy: userId,
            updatedBy: userId
        });

        await newConfig.save();

        return {
            status: 'success',
            message: 'Configuration duplicated successfully',
            config: newConfig
        };
    } catch (error) {
        console.error('DuplicateConfig error:', error);
        return {
            status: 'failed',
            code: 500,
            message: error.message || 'Failed to duplicate configuration'
        };
    }
};

module.exports = {
    getConfig,
    createOrUpdateConfig,
    generateTimings,
    previewTimings,
    validateConfig,
    getConfigHistory,
    duplicateConfig
};