// services/mosqueTimingConfig.service.js
const MosqueTimingConfig = require('../models/mosqueTimingConfig.model');
const mongoose = require('mongoose');

const ok = (data) => ({ status: 'success', ...data });
const fail = (code, message) => ({ status: 'failed', code, message });

// create
exports.create = async (body, adminId) => {
  try {
    const config = await MosqueTimingConfig.create({ ...body, createdBy: adminId });
    return ok({ config });
  } catch (err) {
    console.error('Create MosqueTimingConfig error:', err);
    return fail(err.name === 'ValidationError' ? 400 : 500, 'Failed to create config');
  }
};

// list 
exports.list = async (query) => {
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
    return ok({ configs });
  } catch (err) {
    console.error('List MosqueTimingConfig error:', err);
    return fail(500, 'Failed to fetch configs');
  }
};

// get by id 
exports.getById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return fail(400, 'Invalid ID');
    const config = await MosqueTimingConfig.findById(id);
    if (!config) return fail(404, 'Config not found');
    return ok({ config });
  } catch (err) {
    console.error('Get MosqueTimingConfig error:', err);
    return fail(500, 'Failed to fetch config');
  }
};

// update 
exports.update = async (id, body, adminId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return fail(400, 'Invalid ID');
    const updated = await MosqueTimingConfig.findByIdAndUpdate(
      id,
      { ...body, updatedBy: adminId },
      { new: true, runValidators: true }
    );
    if (!updated) return fail(404, 'Config not found');
    return ok({ config: updated });
  } catch (err) {
    console.error('Update MosqueTimingConfig error:', err);
    return fail(err.name === 'ValidationError' ? 400 : 500, 'Failed to update config');
  }
};

// remove 
exports.remove = async (id, adminId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return fail(400, 'Invalid ID');
    const res = await MosqueTimingConfig.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: adminId },
      { new: true }
    );
    if (!res) return fail(404, 'Config not found');
    return ok({ message: 'Config deactivated' });
  } catch (err) {
    console.error('Delete MosqueTimingConfig error:', err);
    return fail(500, 'Failed to delete config');
  }
};
