const express = require('express');
const router = express.Router();
const Auth = require('../middleware/auth.middleware');
const {
    registerToken,
    unregisterToken,
    sendToUser,
    sendToUsers,
    sendToAll,
    cleanupExpiredTokens,
    getUserTokens
} = require('../controllers/pushNotification.controller');

// User routes (require authentication)
router.use(Auth({ allowedRoles: ['user', 'editor', 'admin'] }));

// Token management
router.post('/register', registerToken);
router.post('/unregister', unregisterToken);
router.get('/tokens', getUserTokens);

// Admin routes (require admin role)
router.use(Auth({ allowedRoles: ['admin'] }));

// Send notifications
router.post('/send/user/:userId', sendToUser);
router.post('/send/users', sendToUsers);
router.post('/send/all', sendToAll);


// System management
router.post('/cleanup/expired-tokens', cleanupExpiredTokens);

module.exports = router;
