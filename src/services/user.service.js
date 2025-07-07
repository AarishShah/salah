const User = require('../models/user.model');

// Get user profile
const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select('phone name language role assignedMosques lastLoginAt loginCount createdAt')
      .populate('assignedMosques', 'name address');
    
    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }
    
    return {
      status: 'success',
      data: { user }
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Error fetching user profile'
    };
  }
};

// Update user profile
const updateProfile = async (userId, updateData) => {
  try {
    // Only allow name and language updates
    const allowedFields = ['name', 'language'];
    const filteredData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }
    
    // Validate language if provided
    if (filteredData.language && !['en', 'ur'].includes(filteredData.language)) {
      return {
        status: 'failed',
        code: 400,
        message: 'Invalid language. Must be "en" or "ur"'
      };
    }
    
    // Validate name if provided
    if (filteredData.name && filteredData.name.trim().length < 2) {
      return {
        status: 'failed',
        code: 400,
        message: 'Name must be at least 2 characters long'
      };
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    ).select('phone name language role');
    
    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }
    
    return {
      status: 'success',
      data: { user },
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Error updating profile'
    };
  }
};

// Delete user profile (soft delete)
const deleteProfile = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }
    
    // Soft delete - set isActive to false and clear refresh tokens
    user.isActive = false;
    user.refreshTokens = [];
    await user.save();
    
    return {
      status: 'success',
      message: 'Account deactivated successfully'
    };
  } catch (error) {
    console.error('Delete profile error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Error deactivating account'
    };
  }
};

// Get user sessions
const getSessions = async (userId) => {
  try {
    const user = await User.findById(userId).select('refreshTokens');
    
    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }
    
    // Format sessions for response
    const sessions = user.refreshTokens.map(token => ({
      id: token._id,
      deviceInfo: token.deviceInfo || 'Unknown device',
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
      isExpired: new Date(token.expiresAt) < new Date()
    }));
    
    return {
      status: 'success',
      data: { sessions }
    };
  } catch (error) {
    console.error('Get sessions error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Error fetching sessions'
    };
  }
};

// Delete specific session
const deleteSession = async (userId, sessionId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }
    
    // Find the session
    const sessionIndex = user.refreshTokens.findIndex(
      token => token._id.toString() === sessionId
    );
    
    if (sessionIndex === -1) {
      return {
        status: 'failed',
        code: 404,
        message: 'Session not found'
      };
    }
    
    // Remove the session
    user.refreshTokens.splice(sessionIndex, 1);
    await user.save();
    
    return {
      status: 'success',
      message: 'Session terminated successfully'
    };
  } catch (error) {
    console.error('Delete session error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Error terminating session'
    };
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  getSessions,
  deleteSession
};