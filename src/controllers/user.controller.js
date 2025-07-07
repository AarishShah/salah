const userService = require('../services/user.service');
const catchError = require('../utils/catchError');

// Get user profile
const getProfile = catchError(async (req, res) => {
  const result = await userService.getProfile(req.user.userId);
  
  if (result.status === 'failed') {
    return res.status(result.code).json(result);
  }
  
  return res.json(result);
});

// Update user profile
const updateProfile = catchError(async (req, res) => {
  const result = await userService.updateProfile(req.user.userId, req.body);
  
  if (result.status === 'failed') {
    return res.status(result.code).json(result);
  }
  
  return res.json(result);
});

// Delete user profile (soft delete)
const deleteProfile = catchError(async (req, res) => {
  const result = await userService.deleteProfile(req.user.userId);
  
  if (result.status === 'failed') {
    return res.status(result.code).json(result);
  }
  
  return res.json(result);
});

// Get user sessions
const getSessions = catchError(async (req, res) => {
  const result = await userService.getSessions(req.user.userId);
  
  if (result.status === 'failed') {
    return res.status(result.code).json(result);
  }
  
  return res.json(result);
});

// Delete specific session
const deleteSession = catchError(async (req, res) => {
  const result = await userService.deleteSession(
    req.user.userId, 
    req.params.sessionId
  );
  
  if (result.status === 'failed') {
    return res.status(result.code).json(result);
  }
  
  return res.json(result);
});

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  getSessions,
  deleteSession
};