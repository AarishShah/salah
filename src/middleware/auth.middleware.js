const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const Auth = (options = {}) => {
  return async (req, res, next) => {
    try {
      // Extract token
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          status: 'failed',
          message: 'No token provided'
        });
      }
      
      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(401).json({
          status: 'failed',
          message: 'Invalid or expired token'
        });
      }
      
      // Get fresh user data
      const user = await User.findById(decoded.userId).select('-otp -refreshTokens');
      
      if (!user) {
        return res.status(404).json({
          status: 'failed',
          message: 'User not found'
        });
      }
      
      if (!user.isActive || user.isBlocked) {
        return res.status(403).json({
          status: 'failed',
          message: 'Account is inactive or blocked'
        });
      }
      
      // Check role requirements
      if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
        return res.status(403).json({
          status: 'failed',
          message: 'Insufficient permissions'
        });
      }
      
      if (options.requiredRole) {
        const roleHierarchy = { 'user': 0, 'editor': 1, 'admin': 2 };
        const userLevel = roleHierarchy[user.role];
        const requiredLevel = roleHierarchy[options.requiredRole];
        
        if (userLevel < requiredLevel) {
          return res.status(403).json({
            status: 'failed',
            message: 'Insufficient role permissions'
          });
        }
      }
      
      // Check specific permission
      if (options.requiredPermission) {
        const userPermissions = user.permissions;
        if (!userPermissions.includes(options.requiredPermission)) {
          return res.status(403).json({
            status: 'failed',
            message: `Missing required permission: ${options.requiredPermission}`
          });
        }
      }
      
      // Check mosque access for editors
      if (options.checkMosqueAccess) {
        const mosqueId = req.params.mosqueId || req.body.mosqueId;
        
        if (mosqueId && !user.canEditMosque(mosqueId)) {
          return res.status(403).json({
            status: 'failed',
            message: 'You do not have access to edit this mosque'
          });
        }
      }
      
      // Attach user to request
      req.user = {
        userId: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        assignedMosques: user.assignedMosques,
        permissions: user.permissions
      };
      
      next();
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        status: 'failed',
        message: 'Authentication error'
      });
    }
  };
};

module.exports = Auth;