const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// You'll need to implement this SMS service
// const smsService = require('./sms.service');

const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    phone: user.phone,
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

const sendOTP = async (phone, name) => {
  try {
    // Check if user exists
    let user = await User.findOne({ phone });

    // If new user, create account
    if (!user) {
      if (!name) {
        return { status: 'failed', code: 400, message: 'Name is required for new users' };
      }
      user = await User.create({ phone, name, role: 'user' });
    }

    // Check if blocked
    if (user.isBlocked) {
      return { status: 'failed', code: 403, message: 'Account is blocked. Contact admin.' };
    }

    // Check OTP rate limiting
    if (user.otp?.lastSentAt) {
      const timeSinceLastOTP = Date.now() - user.otp.lastSentAt.getTime();
      if (timeSinceLastOTP < 60000) { // 1 minute
        const waitTime = Math.ceil((60000 - timeSinceLastOTP) / 1000);
        return { status: 'failed', code: 429, message: `Please wait ${waitTime} seconds before requesting another OTP` };
      }
    }

    // Generate and save OTP
    const otp = user.generateOTP();
    await user.save();

    // Send SMS (implement based on your SMS provider)
    // await smsService.sendSMS(phone, `Your SALAH app OTP is: ${otp}`);

    // For development, log OTP
    console.log(`OTP for ${phone}: ${otp}`);

    return {
      status: 'success',
      message: 'OTP sent successfully',
      isNewUser: user.loginCount === 0,
      // Remove in production
      developmentOTP: process.env.NODE_ENV === 'development' ? otp : undefined
    };

  } catch (error) {
    console.error('SendOTP error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to send OTP'
    };
  }
};

const verifyOTP = async (phone, otp) => {
  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return {
        status: 'failed',
        code: 404,
        message: 'User not found'
      };
    }

    // Clean expired OTPs
    user.cleanExpiredOtp();

    // Check if OTP exists
    if (!user.otp || !user.otp.code) {
      return {
        status: 'failed',
        code: 400,
        message: 'No OTP found. Please request a new one.'
      };
    }

    // Check max attempts
    if (user.otp.attempts >= 3) {
      user.otp = undefined;
      await user.save();
      return {
        status: 'failed',
        code: 429,
        message: 'Maximum attempts exceeded. Please request a new OTP.'
      };
    }

    // Verify OTP
    const isValid = user.verifyOTP(otp);

    if (!isValid) {
      await user.save(); // Save attempt count
      const remainingAttempts = 3 - user.otp.attempts;
      return {
        status: 'failed',
        code: 401,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
      };
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    user.refreshTokens = user.refreshTokens.filter(rt =>
      rt.expiresAt > new Date()
    ); // Clean expired tokens

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
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        assignedMosques: user.assignedMosques
      }
    };

  } catch (error) {
    console.error('VerifyOTP error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to verify OTP'
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


const updateUserRole = async (userId, newRole) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { status: 'failed', code: 404, message: 'User not found' };
    }

    user.role = newRole;
    await user.save();

    return {
      status: 'success',
      message: 'User role updated successfully',
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role
      }
    };
  } catch (error) {
    console.error('UpdateUserRole error:', error);
    return {
      status: 'failed',
      code: 500,
      message: 'Failed to update user role'
    };
  }
};


module.exports = {
  sendOTP,
  verifyOTP,
  refreshToken,
  logout,
  updateUserRole
};
