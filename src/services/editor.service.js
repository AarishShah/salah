const User = require('../models/user.model');

// Editor Services
const getAssignedMosques = async (userId) => {
  try {
    const user = await User.findById(userId)
      .populate('assignedMosques', 'name address city state country isActive');
    
    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }
    
    return {
      status: 'success',
      mosques: user.assignedMosques
    };
  } catch (error) {
    console.error('GetAssignedMosques error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to fetch assigned mosques'
    };
  }
};

module.exports = {
  getAssignedMosques,
};