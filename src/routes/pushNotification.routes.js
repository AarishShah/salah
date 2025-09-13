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
    getUserTokens,
    sendToMosqueUsers,
    scheduleNotification,
    getScheduledNotifications,
    cancelScheduledNotification
} = require('../controllers/pushNotification.controller');

// User routes (require authentication)
router.use(Auth({ allowedRoles: ['user', 'editor', 'admin'] }));

// Token management
router.post('/register', registerToken);
router.post('/unregister', unregisterToken);
router.get('/tokens', getUserTokens);

// Editor routes (require editor or admin role)
router.use(Auth({ allowedRoles: ['editor', 'admin'] }));

// Send notifications to mosque users
router.post('/send/mosque/:mosqueId', Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true }), sendToMosqueUsers);

// Schedule notifications
router.post('/schedule/mosque', Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true }), scheduleNotification);

router.get('/scheduled/mosque/:mosqueId', Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true }), getScheduledNotifications);
router.delete('/scheduled/:notificationId', cancelScheduledNotification);

// Admin routes (require admin role)
router.use(Auth({ allowedRoles: ['admin'] }));

// Send notifications
router.post('/send/user/:userId', sendToUser);
router.post('/send/users', sendToUsers);
router.post('/send/all', sendToAll);

// System management
router.post('/cleanup/expired-tokens', cleanupExpiredTokens);

module.exports = router;
