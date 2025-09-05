const express = require('express');
const router = express.Router();
const Auth = require('../middleware/auth.middleware');
const {
    testMosqueEventNotifications,
    getMosqueEventSchedulerStatus
} = require('../services/mosqueEventNotification.service');

// Admin routes (require admin role)
router.use(Auth({ allowedRoles: ['admin'] }));

// Test mosque event notifications
router.post('/test', async (req, res) => {
    try {
        const result = await testMosqueEventNotifications();
        
        if (result.success) {
            return res.json({
                status: 'success',
                message: result.message,
                data: {
                    user: result.user,
                    mosque: result.mosque
                }
            });
        } else {
            return res.status(400).json({
                status: 'failed',
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in test mosque event notifications route:', error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal server error'
        });
    }
});

// Get scheduler status
router.get('/status', (req, res) => {
    try {
        const status = getMosqueEventSchedulerStatus();
        return res.json({
            status: 'success',
            data: status
        });
    } catch (error) {
        console.error('Error getting mosque event scheduler status:', error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal server error'
        });
    }
});

module.exports = router;
