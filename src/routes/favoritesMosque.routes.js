const express = require('express');
const router = express.Router();
const favoritesMosqueController = require('../controllers/favoritesMosque.controller');
const Auth = require('../middleware/auth.middleware');

// All routes require authentication
const userAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

// Favorite mosques management
router.get('/', userAuth, favoritesMosqueController.getFavoritesMosques);
router.post('/', userAuth, favoritesMosqueController.addFavoriteMosque);
router.delete('/:mosqueId', userAuth, favoritesMosqueController.removeFavoriteMosque);

// Get users who favorited a specific mosque (admin/editor access)
const adminEditorAuth = Auth({ allowedRoles: ['admin', 'editor'] });
router.get('/mosque/:mosqueId/users', adminEditorAuth, favoritesMosqueController.getMosqueFavorites);

module.exports = router;
