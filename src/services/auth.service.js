const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user.model');

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    assignedMosques: user.assignedMosques,
    permissions: user.permissions
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

const googleSignIn = async (idToken) => {
  try {
    // Verify Google ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (error) {
      console.error('Google token verification error:', error);
      return {
        status: 'failed',
        code: 401,
        message: 'Invalid Google ID token'
      };
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update existing user with latest Google info
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.name = name;
      user.profilePicture = picture;
      
      // Check if blocked
      if (user.isBlocked) {
        return { 
          status: 'failed', 
          code: 403, 
          message: 'Account is blocked. Contact admin.' 
        };
      }
    } else {
      // Create new user
      user = new User({
        googleId,
        email,
        name,
        profilePicture: picture,
        authProvider: 'google',
        role: 'user'
      });
    }

    // Clean expired tokens
    user.cleanExpiredTokens();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // Update login info
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();

    return {
      status: 'success',
      message: user.loginCount === 1 ? 'Welcome to SALAH!' : 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        role: user.role,
        permissions: user.permissions,
        assignedMosques: user.assignedMosques,
        isNewUser: user.loginCount === 1
      }
    };

  } catch (error) {
    console.error('GoogleSignIn error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to authenticate with Google'
    };
  }
};

const refreshToken = async (refreshTokenInput) => {
  try {
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshTokenInput, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return {
        status: 'failed',
        code: 401,
        message: 'Invalid refresh token'
      };
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive || user.isBlocked) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found or inactive'
      };
    }

    // Clean expired tokens
    user.cleanExpiredTokens();

    // Check if refresh token exists and is valid
    const tokenIndex = user.refreshTokens.findIndex(rt =>
      rt.token === refreshTokenInput && rt.expiresAt > new Date()
    );

    if (tokenIndex === -1) {
      return {
        status: 'failed',
        code: 401,
        message: 'Invalid or expired refresh token'
      };
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Replace old refresh token with new one
    user.refreshTokens[tokenIndex] = {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    await user.save();

    return {
      status: 'success',
      accessToken,
      refreshToken: newRefreshToken
    };

  } catch (error) {
    console.error('RefreshToken error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to refresh token'
    };
  }
};

const logout = async (userId, refreshToken) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }

    // Remove specific refresh token or all tokens
    if (refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(rt =>
        rt.token !== refreshToken
      );
    } else {
      user.refreshTokens = [];
    }

    await user.save();

    return {
      status: 'success',
      message: 'Logged out successfully'
    };

  } catch (error) {
    console.error('Logout error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to logout'
    };
  }
};

module.exports = {
  googleSignIn,
  refreshToken,
  logout
};