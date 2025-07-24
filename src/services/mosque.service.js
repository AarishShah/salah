const Mosque = require('../models/mosque.model');
const User = require('../models/user.model');
const OfficialMeeqat = require('../models/officialMeeqat.model');
const { getRoutesForMosques } = require('../helpers/mapbox');

// Get nearby mosques
const getNearbyMosques = async (filters) => {
    try {
        const { latitude, longitude, radius, withRoutes } = filters;

        // Convert radius to meters
        const radiusMeters = radius * 1000;
        const userLocation = [longitude, latitude];
        const fetchLimit = 3;

        // Find mosques within radius
        const mosques = await Mosque.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: userLocation },
                    distanceField: 'displacement',
                    maxDistance: radiusMeters,
                    spherical: true,
                    query: { isActive: true }
                }
            },
            { $limit: fetchLimit }
        ]);

        let mosquesResult = mosques.map(mosque => ({
            _id: mosque._id,
            name: mosque.name,
            sect: mosque.sect,
            address: mosque.address,
            locality: mosque.locality,
            contactPerson: mosque.contactPerson,
            coordinates: {
                latitude: mosque.coordinates?.coordinates?.[1] ?? null,
                longitude: mosque.coordinates?.coordinates?.[0] ?? null
            },
            displacement: mosque.displacement,
            route: null
        }));

        // Add routes if requested
        if (withRoutes && process.env.MAPBOX_API_KEY && mosques.length > 0) {
            const routes = await getRoutesForMosques(userLocation, mosques);
            mosquesResult = mosquesResult.map((mosque, idx) => ({
                ...mosque,
                route: routes[idx]
            }));
        }

        return {
            status: 'success',
            data: mosquesResult,
            count: mosquesResult.length
        };
    } catch (error) {
        console.error('GetNearbyMosques error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch nearby mosques'
        };
    }
};

// Search mosques with filters and pagination
const searchMosques = async (filters, pagination) => {
    try {
        const { page, limit, sortBy, sortOrder } = pagination;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        if (filters.name) {
            query.name = { $regex: filters.name, $options: 'i' };
        }

        if (filters.locality) {
            query.locality = { $regex: filters.locality, $options: 'i' };
        }

        if (filters.address) {
            query.address = { $regex: filters.address, $options: 'i' };
        }

        if (filters.sect) {
            query.sect = filters.sect;
        }

        if (filters.schoolOfThought) {
            query.schoolOfThought = filters.schoolOfThought;
        }

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive === 'true';
        }

        // Execute query
        const [mosques, totalCount] = await Promise.all([
            Mosque.find(query)
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            Mosque.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            status: 'success',
            data: mosques,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (error) {
        console.error('SearchMosques error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to search mosques'
        };
    }
};

// Get mosque by ID
const getMosqueById = async (id, userId, userRole) => {
    try {
        const mosque = await Mosque.findById(id)
            .populate('officialMeeqat', 'locationName publisher')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'This mosque is not yet registered with us.'
            };
        }

        // Check if editor is assigned
        let isAssignedEditor = false;
        if (userId && userRole === 'editor') {
            const user = await User.findById(userId);
            isAssignedEditor = user?.assignedMosques?.some(
                mId => mId.toString() === mosque._id.toString()
            ) || false;
        }

        // Build response based on role and mosque status
        const baseResponse = {
            status: 'success',
            data: mosque
        };

        if (!mosque.isActive) {
            if (userRole === 'admin' || (userRole === 'editor' && isAssignedEditor)) {
                baseResponse.warning = 'This mosque is currently inactive because some required fields are missing.';
            } else {
                return {
                    status: 'success',
                    message: 'This mosque is currently not being maintained by our system.'
                };
            }
        }

        return baseResponse;
    } catch (error) {
        console.error('GetMosqueById error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch mosque'
        };
    }
};

// Set official meeqat for mosque (continued)
const setOfficialMeeqat = async (data) => {
    try {
        const { mosqueId, officialMeeqatId, userId, userRole } = data;

        // Fetch mosque
        const mosque = await Mosque.findById(mosqueId);
        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        // Check authorization for editors
        if (userRole === 'editor') {
            const user = await User.findById(userId);
            const isAssigned = user?.assignedMosques?.some(
                mId => mId.toString() === mosque._id.toString()
            ) || false;

            if (!isAssigned) {
                return {
                    status: 'failed',
                    code: 403,
                    message: 'You are not authorized to update this mosque'
                };
            }
        }

        // Fetch official meeqat
        const officialMeeqat = await OfficialMeeqat.findById(officialMeeqatId);
        if (!officialMeeqat) {
            return {
                status: 'failed',
                code: 404,
                message: 'Official Meeqat not found'
            };
        }

        // Validate sect compatibility
        if (mosque.sect !== officialMeeqat.sect) {
            return {
                status: 'failed',
                code: 400,
                message: `Sect mismatch: Mosque is ${mosque.sect} but Official Meeqat is ${officialMeeqat.sect}`
            };
        }

        // Validate school of thought compatibility (for Sunni only)
        if (mosque.sect === 'sunni' && mosque.schoolOfThought !== officialMeeqat.schoolOfThought) {
            return {
                status: 'failed',
                code: 400,
                message: `School of thought mismatch: Mosque follows ${mosque.schoolOfThought} but Official Meeqat is for ${officialMeeqat.schoolOfThought}`
            };
        }

        // Update mosque with official meeqat
        const updatedMosque = await Mosque.findByIdAndUpdate(
            mosqueId,
            {
                officialMeeqat: officialMeeqatId,
                updatedBy: userId
            },
            { new: true, runValidators: true }
        ).populate('officialMeeqat', 'locationName publisher');

        return {
            status: 'success',
            message: 'Official Meeqat successfully linked to mosque',
            data: updatedMosque
        };

    } catch (error) {
        console.error('SetOfficialMeeqat error:', error);

        if (error.name === 'ValidationError') {
            return {
                status: 'failed',
                code: 400,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            };
        }

        return {
            status: 'failed',
            code: 500,
            message: 'Failed to set official meeqat'
        };
    }
};

// Create new mosque
const createMosque = async (data) => {
    try {
        const { name, address, locality, coordinates, sect, schoolOfThought, createdBy } = data;

        // Check for existing mosque at the same coordinates
        if (coordinates && coordinates.coordinates) {
            const existing = await Mosque.findOne({
                'coordinates.coordinates': coordinates.coordinates
            });

            if (existing) {
                return {
                    status: 'failed',
                    code: 409,
                    message: 'A mosque already exists at these coordinates'
                };
            }
        }

        // Create new mosque
        const newMosque = new Mosque({
            name,
            address,
            locality,
            coordinates,
            sect,
            schoolOfThought: sect === 'sunni' ? schoolOfThought : undefined,
            createdBy
        });

        await newMosque.save();

        // Populate creator info
        await newMosque.populate('createdBy', 'name email');

        return {
            status: 'success',
            message: 'Mosque created successfully',
            data: newMosque
        };

    } catch (error) {
        console.error('CreateMosque error:', error);

        if (error.code === 11000 && error.keyPattern && error.keyPattern['coordinates.coordinates']) {
            return {
                status: 'failed',
                code: 409,
                message: 'A mosque already exists at these coordinates'
            };
        }

        if (error.name === 'ValidationError') {
            return {
                status: 'failed',
                code: 400,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            };
        }

        return {
            status: 'failed',
            code: 500,
            message: 'Failed to create mosque'
        };
    }
};

// Soft delete mosque
const softDeleteMosque = async (id, userId) => {
    try {
        const mosque = await Mosque.findById(id);

        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        // Check if already soft deleted
        const isAlreadySoftDeleted =
            mosque.isActive === false &&
            mosque.officialMeeqat === null &&
            mosque.meeqatConfig === null &&
            mosque.mosqueMeeqat === null &&
            mosque.contactPerson === null;

        if (isAlreadySoftDeleted) {
            return {
                status: 'success',
                message: 'Mosque is already in a soft delete state',
                data: mosque
            };
        }

        // Perform soft delete
        const updatedMosque = await Mosque.findByIdAndUpdate(
            id,
            {
                isActive: false,
                officialMeeqat: null,
                meeqatConfig: null,
                mosqueMeeqat: null,
                contactPerson: null,
                updatedBy: userId
            },
            { new: true, runValidators: true }
        ).populate('updatedBy', 'name email');

        return {
            status: 'success',
            message: 'Mosque has been successfully soft deleted',
            data: updatedMosque
        };

    } catch (error) {
        console.error('SoftDeleteMosque error:', error);

        if (error.name === 'ValidationError') {
            return {
                status: 'failed',
                code: 400,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            };
        }

        return {
            status: 'failed',
            code: 500,
            message: 'Failed to soft delete mosque'
        };
    }
};

module.exports = {
    getNearbyMosques,
    searchMosques,
    getMosqueById,
    setOfficialMeeqat,
    createMosque,
    softDeleteMosque
};