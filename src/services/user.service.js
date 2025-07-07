const User = require('../models/user.model');
const EditorRequest = require('../models/editorRequest.model');
const MosqueTimingConfig = require('../models/mosqueTimingConfig.model');

// User Services
const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select('-refreshTokens -__v')
      .populate('assignedMosques', 'name city country');
    
    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }
    
    return {
      status: 'success',
      user
    };
  } catch (error) {
    console.error('GetProfile error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to fetch profile'
    };
  }
};

const updateProfile = async (userId, updates) => {
  try {
    // Only allow specific fields to be updated
    const allowedUpdates = ['name', 'phone', 'language'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    if (Object.keys(filteredUpdates).length === 0) {
      return {
        status: 'failed',
        code: 400,
        message: 'No valid fields to update'
      };
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-refreshTokens -__v');
    
    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }
    
    return {
      status: 'success',
      message: 'Profile updated successfully',
      user
    };
  } catch (error) {
    console.error('UpdateProfile error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to update profile'
    };
  }
};

const deleteAccount = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }
    
    // Check if user is the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return {
          status: 'failed',
          code: 400,
          message: 'Cannot delete the last admin account'
        };
      }
    }
    
    // Soft delete - mark as inactive
    user.isActive = false;
    user.refreshTokens = []; // Clear all tokens
    user.assignedMosques = []; // Remove mosque assignments
    await user.save();
    
    return {
      status: 'success',
      message: 'Account deleted successfully'
    };
  } catch (error) {
    console.error('DeleteAccount error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to delete account'
    };
  }
};

const createEditorRequest = async (userId, mosqueIds, reason) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }
    
    if (user.role !== 'user') {
      return {
        status: 'failed',
        code: 400,
        message: 'Only users can request editor role'
      };
    }
    
    // Check if user already has pending request
    const existingRequest = await EditorRequest.findOne({
      userId,
      status: 'pending'
    });
    
    if (existingRequest) {
      return {
        status: 'failed',
        code: 400,
        message: 'You already have a pending editor request'
      };
    }
    
    // Validate mosque IDs
    const validMosques = await MosqueTimingConfig.find({
      _id: { $in: mosqueIds },
      isActive: true
    });
    
    if (validMosques.length !== mosqueIds.length) {
      return {
        status: 'failed',
        code: 400,
        message: 'Some selected mosques are invalid'
      };
    }
    
    // Check if any mosque already has an editor
    const mosquesWithEditors = await User.find({
      role: 'editor',
      isActive: true,
      assignedMosques: { $in: mosqueIds }
    }).select('assignedMosques');
    
    if (mosquesWithEditors.length > 0) {
      return {
        status: 'failed',
        code: 400,
        message: 'Some selected mosques already have editors'
      };
    }
    
    // Create editor request
    const editorRequest = new EditorRequest({
      userId,
      requestedMosques: mosqueIds,
      reason: reason || '',
      status: 'pending'
    });
    
    await editorRequest.save();
    
    return {
      status: 'success',
      message: 'Editor request submitted successfully',
      request: editorRequest
    };
  } catch (error) {
    console.error('CreateEditorRequest error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to create editor request'
    };
  }
};

const getEditorRequestStatus = async (userId) => {
  try {
    const request = await EditorRequest.findOne({ userId })
      .sort('-createdAt')
      .populate('requestedMosques', 'name city country')
      .populate('reviewedBy', 'name email');
    
    if (!request) {
      return {
        status: 'success',
        request: null,
        message: 'No editor request found'
      };
    }
    
    return {
      status: 'success',
      request
    };
  } catch (error) {
    console.error('GetEditorRequestStatus error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to fetch editor request status'
    };
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  createEditorRequest,
  getEditorRequestStatus,
};