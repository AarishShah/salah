const router = require('express').Router();
const userController = require('../controllers/user.controller');
const Auth = require('../middleware/auth.middleware');

// User profile management
router.get('/profile', Auth(), userController.getProfile);
router.put('/profile', Auth(), userController.updateProfile);
router.delete('/profile', Auth(), userController.deleteProfile);

// Session management
router.get('/sessions', Auth(), userController.getSessions);
router.delete('/sessions/:sessionId', Auth(), userController.deleteSession);

module.exports = router;