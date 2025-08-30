const favoritesMosqueService = require('../services/favoritesMosque.service');
const catchError = require('../utils/catchError');

// Add mosque to favorites
const addFavoriteMosque = catchError(async (req, res) => {
    const { userId } = req.user;
    const { mosqueId } = req.body;

    if (!mosqueId) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Mosque ID is required'
        });
    }

    const result = await favoritesMosqueService.addFavoriteMosque(userId, mosqueId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.status(201).json(result);
});

// Remove mosque from favorites
const removeFavoriteMosque = catchError(async (req, res) => {
    const { userId } = req.user;
    const { mosqueId } = req.params;

    if (!mosqueId) {
        return res.status(400).json({
            status: 'failed',
            code: 400,
            message: 'Mosque ID is required'
        });
    }

    const result = await favoritesMosqueService.removeFavoriteMosque(userId, mosqueId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

// Get user's favorite mosques
const getFavoritesMosques = catchError(async (req, res) => {
    const { userId } = req.user;

    const result = await favoritesMosqueService.getFavoritesMosques(userId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});



// Get users who have favorited a specific mosque
const getMosqueFavorites = catchError(async (req, res) => {
    const { mosqueId } = req.params;

    const result = await favoritesMosqueService.getMosqueFavorites(mosqueId);

    if (result.status === 'failed') {
        return res.status(result.code || 400).json(result);
    }

    return res.json(result);
});

module.exports = {
    addFavoriteMosque,
    removeFavoriteMosque,
    getFavoritesMosques,
    getMosqueFavorites
};
