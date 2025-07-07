const adminService = require("../services/admin.service");
const catchError = require("../utils/catchError");

// Admin Controllers
const getAllUsers = catchError(async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query;
  
  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    role,
    status,
    search
  };
  
  const result = await adminService.getAllUsers(filters);
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

const getUser = catchError(async (req, res) => {
  const { userId } = req.params;
  
  const result = await adminService.getUser(userId);
  
  if (result.status === 'failed') {
    return res.status(result.code || 404).json(result);
  }
  
  return res.json(result);
});

const updateUserRole = catchError(async (req, res) => {
  const { userId } = req.params;
  const { role, mosqueIds } = req.body;
  
  if (!role || !['user', 'editor', 'admin'].includes(role)) {
    return res.status(400).json({
      status: 'failed',
      message: 'Valid role is required'
    });
  }
  
  const result = await adminService.updateUserRole(userId, role, mosqueIds);
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

const updateUserStatus = catchError(async (req, res) => {
  const { userId } = req.params;
  const { isBlocked, blockedReason } = req.body;
  
  if (typeof isBlocked !== 'boolean') {
    return res.status(400).json({
      status: 'failed',
      message: 'isBlocked must be a boolean'
    });
  }
  
  const result = await adminService.updateUserStatus(userId, isBlocked, blockedReason);
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

const updateUserMosques = catchError(async (req, res) => {
  const { userId } = req.params;
  const { mosqueIds } = req.body;
  
  if (!Array.isArray(mosqueIds)) {
    return res.status(400).json({
      status: 'failed',
      message: 'mosqueIds must be an array'
    });
  }
  
  const result = await adminService.updateUserMosques(userId, mosqueIds);
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

const getAllEditors = catchError(async (req, res) => {
  const result = await adminService.getAllEditors();
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

const getEditorRequests = catchError(async (req, res) => {
  const { status = 'pending' } = req.query;
  
  const result = await adminService.getEditorRequests(status);
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

const handleEditorRequest = catchError(async (req, res) => {
  const { requestId } = req.params;
  const { action, rejectionReason } = req.body;
  const adminId = req.user.userId;
  
  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      status: 'failed',
      message: 'Action must be either approve or reject'
    });
  }
  
  const result = await adminService.handleEditorRequest(requestId, action, adminId, rejectionReason);
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

const getUserStats = catchError(async (req, res) => {
  const result = await adminService.getUserStats();
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

module.exports = {
  getAllUsers,
  getUser,
  updateUserRole,
  updateUserStatus,
  updateUserMosques,
  getAllEditors,
  getEditorRequests,
  handleEditorRequest,
  getUserStats,
};