const User = require('../models/user.model');
const Mosque = require('../models/mosque.model');

// Add mosque to favorites
const addFavoriteMosque = async (userId, mosqueId) => {
    try {
        // Get max favorites limit from environment variable
        const maxFavoritesAllowed = parseInt(process.env.MAX_FAVOURITE_DEFAULT) || 1;

        // Check if mosque exists and is active
        const mosque = await Mosque.findOne({ _id: mosqueId, isActive: true });
        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found or inactive'
            };
        }

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return {
                status: 'failed',
                code: 404,
                message: 'User not found'
            };
        }

        // Check if already in favorites
        if (user.favoritesMosques.includes(mosqueId)) {
            return {
                status: 'failed',
                code: 409,
                message: 'Mosque is already in your favorites',
                data: {
                    totalFavorites: user.favoritesMosques.length,
                    maxAllowed: maxFavoritesAllowed
                }
            };
        }

        // Check limit based on environment variable
        if (user.favoritesMosques.length >= maxFavoritesAllowed) {
            return {
                status: 'failed',
                code: 400,
                message: `You can only have ${maxFavoritesAllowed} favorite mosque${maxFavoritesAllowed > 1 ? 's' : ''} currently. Please remove an existing one first.`,
                data: {
                    totalFavorites: user.favoritesMosques.length,
                    maxAllowed: maxFavoritesAllowed
                }
            };
        }

        // Add to favorites
        user.favoritesMosques.push(mosqueId);

        // Also add user to mosque's favoritedBy array
        if (!mosque.favoritedBy.includes(userId)) {
            mosque.favoritedBy.push(userId);
        }

        // Save both user and mosque
        await Promise.all([
            user.save(),
            mosque.save()
        ]);

        // Populate mosque details for response
        await user.populate('favoritesMosques', 'name address locality coordinates sect schoolOfThought');

        return {
            status: 'success',
            message: 'Mosque added to favorites successfully',
            data: {
                favoritesMosques: user.favoritesMosques,
                totalFavorites: user.favoritesMosques.length,
                maxAllowed: maxFavoritesAllowed
            }
        };

    } catch (error) {
        console.error('AddFavoriteMosque error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to add mosque to favorites'
        };
    }
};

// Remove mosque from favorites
const removeFavoriteMosque = async (userId, mosqueId) => {
    try {
        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return {
                status: 'failed',
                code: 404,
                message: 'User not found'
            };
        }

        // Check if mosque is in favorites
        if (!user.favoritesMosques.includes(mosqueId)) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found in your favorites'
            };
        }

        // Remove from favorites
        user.favoritesMosques = user.favoritesMosques.filter(id => !id.equals(mosqueId));

        // Also remove user from mosque's favoritedBy array
        const mosque = await Mosque.findById(mosqueId);
        if (mosque) {
            mosque.favoritedBy = mosque.favoritedBy.filter(id => !id.equals(userId));
            await Promise.all([
                user.save(),
                mosque.save()
            ]);
        } else {
            await user.save();
        }

        // Populate remaining mosque details for response
        await user.populate('favoritesMosques', 'name address locality coordinates sect schoolOfThought');

        // Get max favorites limit from environment variable
        const maxFavoritesAllowed = parseInt(process.env.MAX_FAVOURITE_DEFAULT) || 1;

        return {
            status: 'success',
            message: 'Mosque removed from favorites successfully',
            data: {
                favoritesMosques: user.favoritesMosques,
                totalFavorites: user.favoritesMosques.length,
                maxAllowed: maxFavoritesAllowed
            }
        };

    } catch (error) {
        console.error('RemoveFavoriteMosque error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to remove mosque from favorites'
        };
    }
};

// Get user's favorite mosques
const getFavoritesMosques = async (userId) => {
    try {
        const user = await User.findById(userId)
            .populate('favoritesMosques', 'name address locality coordinates sect schoolOfThought isActive')
            .lean();

        if (!user) {
            return {
                status: 'failed',
                code: 404,
                message: 'User not found'
            };
        }

        // Filter out inactive mosques
        const activeFavorites = user.favoritesMosques.filter(mosque => mosque.isActive);

        // Get max favorites limit from environment variable
        const maxFavoritesAllowed = parseInt(process.env.MAX_FAVOURITE_DEFAULT) || 1;

        return {
            status: 'success',
            data: {
                favoritesMosques: activeFavorites,
                totalFavorites: activeFavorites.length,
                maxAllowed: maxFavoritesAllowed
            }
        };

    } catch (error) {
        console.error('GetFavoritesMosques error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch favorite mosques'
        };
    }
};



// Get users who have favorited a specific mosque
const getMosqueFavorites = async (mosqueId) => {
    try {
        // Check if mosque exists
        const mosque = await Mosque.findById(mosqueId)
            .populate('favoritedBy', 'name email profile.firstName profile.lastName')
            .lean();

        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }


        return {
            status: 'success',
            data: {
                mosque: {
                    id: mosque._id,
                    name: mosque.name,
                    address: mosque.address
                },
                favoritedBy: mosque.favoritedBy,
                totalFavorites: mosque.favoritedBy.length
            }
        };

    } catch (error) {
        console.error('GetMosqueFavorites error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch mosque favorites'
        };
    }
};

module.exports = {
    addFavoriteMosque,
    removeFavoriteMosque,
    getFavoritesMosques,
    getMosqueFavorites
};
