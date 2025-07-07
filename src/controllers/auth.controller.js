const authService = require("../services/auth.service");
const catchError = require("../utils/catchError");

const googleSignIn = catchError(async (req, res) => {
  const { idToken } = req.body;
  
  if (!idToken) {
    return res.status(400).json({ 
      status: 'failed', 
      message: 'Google ID token is required' 
    });
  }
  
  const result = await authService.googleSignIn(idToken);
  
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
  googleSignIn,
  refreshToken,
  logout
};