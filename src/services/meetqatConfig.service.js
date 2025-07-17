const MeetqatConfig = require('../models/meetqatConfig.model');
const Mosque = require('../models/mosque.model');
const mongoose = require('mongoose');

// Helper function to check mosque access
const checkMosqueAccess = (mosqueId, role, assignedMosques) => {
    if (role === 'admin') return true;
    return assignedMosques.some(id => id.toString() === mosqueId.toString());
};

// Get config by mosque ID
const getConfigByMosqueId = async (mosqueId, role, assignedMosques) => {
    try {
        // Check mosque access
        if (!checkMosqueAccess(mosqueId, role, assignedMosques)) {
            return {
                status: 'failed',
                code: 403,
                message: 'You do not have access to this mosque'
            };
        }

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
        const config = await MeetqatConfig.findOne({ mosque: mosqueId })
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

        return {
            status: 'success',
            config
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
const createConfig = async (mosqueId, configData, userId, role, assignedMosques) => {
    try {
        // Check mosque access
        if (!checkMosqueAccess(mosqueId, role, assignedMosques)) {
            return {
                status: 'failed',
                code: 403,
                message: 'You do not have access to this mosque'
            };
        }

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
        const existingConfig = await MeetqatConfig.findOne({ mosque: mosqueId });
        if (existingConfig) {
            return {
                status: 'failed',
                code: 409,
                message: 'Config already exists for this mosque'
            };
        }

        // Create config
        const newConfig = new MeetqatConfig({
            mosque: mosqueId,
            createdBy: userId,
            ...configData
        });

        await newConfig.save();

        // Update mosque with config reference
        mosque.meetqatConfig = newConfig._id;
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
const updateConfigByMosqueId = async (mosqueId, updateData, userId, role, assignedMosques) => {
    try {
        // Check mosque access
        if (!checkMosqueAccess(mosqueId, role, assignedMosques)) {
            return {
                status: 'failed',
                code: 403,
                message: 'You do not have access to this mosque'
            };
        }

        // Find config by mosque ID
        const config = await MeetqatConfig.findOne({ mosque: mosqueId });
        if (!config) {
            return {
                status: 'failed',
                code: 404,
                message: 'No config found for this mosque'
            };
        }

        // Remove fields that shouldn't be updated
        const { mosque, createdBy, _id, ...updateFields } = updateData;

        // Update config
        Object.assign(config, updateFields);
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
const deleteConfigByMosqueId = async (mosqueId, role, assignedMosques) => {
    try {
        // Check mosque access
        if (!checkMosqueAccess(mosqueId, role, assignedMosques)) {
            return {
                status: 'failed',
                code: 403,
                message: 'You do not have access to this mosque'
            };
        }

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
        const config = await MeetqatConfig.findOne({ mosque: mosqueId });
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
            { $unset: { meetqatConfig: 1 } }
        );

        // Delete config
        await MeetqatConfig.deleteOne({ _id: config._id });

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