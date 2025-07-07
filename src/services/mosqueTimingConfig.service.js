// services/mosqueTimingConfig.service.js
const MosqueTimingConfig = require('../models/mosqueTimingConfig.model');
const mongoose = require('mongoose');

const ok = (data) => ({ status: 'success', ...data });
const fail = (code, message) => ({ status: 'failed', code, message });

// create
const create = async (body, adminId) => {
  try {
    const config = await MosqueTimingConfig.create({ ...body, createdBy: adminId });
    return {
      status: 'success',
      message: 'Mosque Timing Config created successfully',
      code: 201,
      data: { config }
    };
  } catch (err) {
    console.error('Create MosqueTimingConfig error:', err);
    return { status: 'failed', code: err.name === 'ValidationError' ? 400 : 500, message: 'Failed to create config' };
  }
};

// list 
const list = async (query) => {
  try {
    const { locality, lat, lng, radius = 5 } = query;
    const q = { isActive: true };

    if (locality) q['mosqueInfo.locality'] = new RegExp(locality, 'i');
    if (lat && lng) {
      q['mosqueInfo.coordinates'] = {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      };
    }

    const configs = await MosqueTimingConfig.find(q).lean();
    return { status: 'success', code: 200, message: 'Configs fetched successfully', data: { configs } };
  } catch (err) {
    console.error('List MosqueTimingConfig error:', err);
    return { status: 'failed', code: 500, message: 'Failed to fetch configs' };
  }
};

// get by id 
const getById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return { status: 'failed', code: 400, message: 'Invalid ID' };
    const config = await MosqueTimingConfig.findById(id);
    if (!config) return { status: 'failed', code: 404, message: 'Config not found' };
    return {
      status: 'success',
      code: 200,
      message: 'Config fetched successfully',
      data: { config }
    };
  } catch (err) {
    console.error('Get MosqueTimingConfig error:', err);
     return {
      status: 'failed',
      code: 500,
      message: 'Failed to fetch config'
    };
  }
};

// update 
const update = async (id, body, adminId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return fail(400, 'Invalid ID');
    const updated = await MosqueTimingConfig.findByIdAndUpdate(
      id,
      { ...body, updatedBy: adminId },
      { new: true, runValidators: true }
    );
    if (!updated) return {status: 'failed', code: 404, message: 'Config not found'};
    return {
      status: 'success',
      code: 200,
      message: 'Config updated successfully',
    };
  } catch (err) {
    console.error('Update MosqueTimingConfig error:', err);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to update config'
    };
  }
};

// remove 
const remove = async (id, adminId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return fail(400, 'Invalid ID');
    const res = await MosqueTimingConfig.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: adminId },
      { new: true }
    );
    if (!res) return { status: 'failed', code: 404, message: 'Config not found' };
    return {
      status: 'success',
      code: 200,
      message: 'Config deactivated',
    };
  } catch (err) {
    console.error('Delete MosqueTimingConfig error:', err);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to delete config'
    };
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  remove
};
