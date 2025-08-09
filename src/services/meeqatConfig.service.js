const MeeqatConfig = require('../models/meeqatConfig.model');
const Mosque = require('../models/mosque.model');
const { formatTime } = require('../helpers/meeqatConfig/meeqatConfigFormatTime.helper');
const { processTimeFields } = require('../helpers/meeqatConfig/meeqatConfigProcessTime.helper');

// Get config by mosque ID with optional format transformation
const getConfigByMosqueId = async (mosqueId, format = '12h') => {
    try {
        // Check if mosque exists
        const mosque = await Mosque.findById(mosqueId);
        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        // Find config by mosque ID
        const config = await MeeqatConfig.findOne({ mosque: mosqueId })
            .populate('mosque', 'name address locality')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!config) {
            return {
                status: 'success',
                message: 'No config for this mosque yet',
                config: null
            };
        }

        let responseConfig = config.toObject();

        // Early return for original format (no transformation)
        if (format === 'original') {
            return {
                status: 'success',
                config: responseConfig,
                format: 'original'
            };
        }

        // Transform time fields
        const timeFormat = format === '24h' ? '24h' : '12h'; // Default to 12h
        responseConfig = formatTime(responseConfig, timeFormat);

        return {
            status: 'success',
            config: responseConfig,
            format: timeFormat
        };
    } catch (error) {
        console.error('GetConfigByMosqueId error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch config'
        };
    }
};

// Create new config
const createConfig = async (mosqueId, configData, userId) => {
    try {
        // Check if mosque exists
        const mosque = await Mosque.findById(mosqueId);
        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        // Check if config already exists
        const existingConfig = await MeeqatConfig.findOne({ mosque: mosqueId });
        if (existingConfig) {
            return {
                status: 'failed',
                code: 409,
                message: 'Config already exists for this mosque'
            };
        }

        // Process time fields
        const timeProcessResult = processTimeFields(configData);
        if (!timeProcessResult.success) {
            return {
                status: 'failed',
                code: 400,
                message: `Time conversion error: ${timeProcessResult.error}`
            };
        }

        // Create config
        const newConfig = new MeeqatConfig({
            mosque: mosqueId,
            createdBy: userId,
            ...timeProcessResult.data
        });

        await newConfig.save();

        // Update mosque with config reference
        mosque.meeqatConfig = newConfig._id;
        await mosque.save();

        // Populate before returning
        await newConfig.populate('mosque', 'name address locality');
        await newConfig.populate('createdBy', 'name email');

        return {
            status: 'success',
            message: 'Config created successfully',
            config: newConfig
        };
    } catch (error) {
        console.error('CreateConfig error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to create config'
        };
    }
};

// Update config by mosque ID
const updateConfigByMosqueId = async (mosqueId, updateData, userId) => {
    try {
        // Find config by mosque ID
        const config = await MeeqatConfig.findOne({ mosque: mosqueId });
        if (!config) {
            return {
                status: 'failed',
                code: 404,
                message: 'No config found for this mosque'
            };
        }

        // Remove fields that shouldn't be updated
        const { mosque, createdBy, _id, ...updateFields } = updateData;

        // Process time fields
        const timeProcessResult = processTimeFields(updateFields);
        if (!timeProcessResult.success) {
            return {
                status: 'failed',
                code: 400,
                message: `Time conversion error: ${timeProcessResult.error}`
            };
        }

        // Update config
        Object.assign(config, timeProcessResult.data);
        config.updatedBy = userId;
        config.lastGeneratedAt = new Date();

        await config.save();

        // Populate before returning
        await config.populate('mosque', 'name address locality');
        await config.populate('createdBy', 'name email');
        await config.populate('updatedBy', 'name email');

        return {
            status: 'success',
            message: 'Config updated successfully',
            config
        };
    } catch (error) {
        console.error('UpdateConfigByMosqueId error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to update config'
        };
    }
};

// Delete config by mosque ID
const deleteConfigByMosqueId = async (mosqueId) => {
    try {
        // Check if mosque exists
        const mosque = await Mosque.findById(mosqueId);
        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        // Find config
        const config = await MeeqatConfig.findOne({ mosque: mosqueId });
        if (!config) {
            return {
                status: 'failed',
                code: 404,
                message: 'No config found for this mosque'
            };
        }

        // Remove config reference from mosque
        await Mosque.findByIdAndUpdate(
            mosqueId,
            { $unset: { meeqatConfig: 1 } }
        );

        // Delete config
        await MeeqatConfig.deleteOne({ _id: config._id });

        return {
            status: 'success',
            message: 'Config deleted successfully'
        };
    } catch (error) {
        console.error('DeleteConfigByMosqueId error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to delete config'
        };
    }
};

module.exports = {
    getConfigByMosqueId,
    createConfig,
    updateConfigByMosqueId,
    deleteConfigByMosqueId
};