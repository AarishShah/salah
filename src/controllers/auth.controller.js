const authService = require("../services/auth.service");
const catchError = require("../utils/catchError");

const sendOTP = catchError(async (req, res) => {
  const { phone, name } = req.body;
  
  if (!phone) {
    return res.status(400).json({ 
      status: 'failed', 
      message: 'Phone number is required' 
    });
  }
  
  const result = await authService.sendOTP(phone, name);
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

const verifyOTP = catchError(async (req, res) => {
  const { phone, otp } = req.body;
  
  if (!phone || !otp) {
    return res.status(400).json({ 
      status: 'failed', 
      message: 'Phone and OTP are required' 
    });
  }
  
  const result = await authService.verifyOTP(phone, otp);
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

const refreshToken = catchError(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ 
      status: 'failed', 
      message: 'Refresh token is required' 
    });
  }
  
  const result = await authService.refreshToken(refreshToken);
  
  if (result.status === 'failed') {
    return res.status(result.code || 401).json(result);
  }
  
  return res.json(result);
});

const logout = catchError(async (req, res) => {
  const { userId } = req.user;
  const { refreshToken } = req.body;
  
  const result = await authService.logout(userId, refreshToken);
  
  if (result.status === 'failed') {
    return res.status(result.code || 400).json(result);
  }
  
  return res.json(result);
});

module.exports = {
  sendOTP,
  verifyOTP,
  refreshToken,
  logout
};