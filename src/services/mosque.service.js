const Mosque = require('../models/mosque.model');
const User = require('../models/user.model');
const OfficialMeeqat = require('../models/officialMeeqat.model');
const { getRoutesForMosques } = require('../helpers/mapbox');

// Fetch mosques within a radius (in km) from given coordinates
const getNearbyMosques = async ({ latitude, longitude, radius = 2, withRoutes = false }) => {
    try {
        // Convert radius to meters
        const radiusMeters = radius * 1000;
        // MongoDB expects [lng, lat]
        const userLocation = [longitude, latitude];
        const fetchLimit = 3; // Adjust Later

        // Find mosques within radius, sorted by distance, limit 10
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

        if (withRoutes && process.env.MAPBOX_API_KEY && mosques.length > 0) {
            const routes = await getRoutesForMosques(userLocation, mosques);
            mosquesResult = mosquesResult.map((mosque, idx) => ({
                ...mosque,
                route: routes[idx]
            }));
        }

        return {
            status: 'success',
            mosques: mosquesResult
        };
    } catch (error) {
        console.error('getNearbyMosques error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch nearby mosques'
        };
    }
};

const getMosqueById = async (id, userId = null) => {
    try {
        const mosque = await Mosque.findById(id);
        if (!mosque) {
            return { status: 'failed', code: 404, message: 'Mosque not found' };
        }
        let isAssignedEditor = false;
        if (userId) {
            const user = await User.findById(userId);
            if (user && user.role === 'editor') {
                isAssignedEditor = user.assignedMosques.some(mId => mId.toString() === mosque._id.toString());
            }
        }
        return {
            status: 'success',
            mosque,
            isActive: mosque.isActive,
            isAssignedEditor
        };
    } catch (error) {
        console.error('getMosqueById error:', error);
        return { status: 'failed', code: 500, message: 'Failed to fetch mosque' };
    }
};

const searchMosques = async (query) => {
    try {
        const { locality, sect, schoolOfThought, address, page = 1, limit = 10 } = query;
        const filter = {};
        // include search based in isActive status and also add name @Mueed @Aarish
        if (locality) filter.locality = { $regex: locality, $options: 'i' };
        if (sect) filter.sect = sect;
        if (schoolOfThought) filter.schoolOfThought = schoolOfThought;
        if (address) filter.address = { $regex: address, $options: 'i' };
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [mosques, total] = await Promise.all([
            // Add filter by name and isActive
            Mosque.find(filter).skip(skip).limit(parseInt(limit)),
            Mosque.countDocuments(filter)
        ]);
        return {
            status: 'success',
            mosques,
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
        };
    } catch (error) {
        console.error('searchMosques error:', error);
        return { status: 'failed', code: 500, message: 'Failed to search mosques' };
    }
};

const setOfficialMeeqat = async (mosqueId, officialMeeqatId, userId, userRole) => {
    try {
        // Fetch mosque
        const mosque = await Mosque.findById(mosqueId);
        if (!mosque) {
            return { status: 'failed', code: 404, message: 'Mosque not found' };
        }

        // Check if editor is assigned to this mosque (if user is editor)
        if (userRole === 'editor') {
            const user = await User.findById(userId);
            const isAssigned = user.assignedMosques.some(
                mId => mId.toString() === mosque._id.toString()
            );
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
            return { status: 'failed', code: 404, message: 'Official Meeqat not found' };
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
        mosque.officialMeeqat = officialMeeqatId;
        mosque.updatedBy = userId;
        
        // Check if mosque can be activated
        // A mosque is active if it has at least one timing source and a contact person
        // if (mosque.contactPerson && (mosque.officialMeeqat || mosque.meeqatConfig || mosque.mosqueMeeqat)) {
        //     mosque.isActive = true;
        // }

        await mosque.save();

        // Populate the official meeqat details in response
        await mosque.populate('officialMeeqat', 'locationName publisher');

        return {
            status: 'success',
            message: 'Official Meeqat successfully linked to mosque',
            mosque
        };

    } catch (error) {
        console.error('setOfficialMeeqat error:', error);
        return { status: 'failed', code: 500, message: 'Failed to set official meeqat' };
    }
};

const createMosque = async (data) => {
    try {
        // Only allow these fields
        const allowedFields = ['name', 'address', 'locality', 'coordinates', 'sect', 'schoolOfThought', 'createdBy'];
        const mosqueData = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                mosqueData[field] = data[field];
            }
        }
        // Check for existing mosque at the same coordinates
        if (mosqueData.coordinates && mosqueData.coordinates.coordinates) {
            const existing = await Mosque.findOne({ 'coordinates.coordinates': mosqueData.coordinates.coordinates });
            if (existing) {
                return {
                    status: 'failed',
                    code: 400,
                    message: 'A mosque already exists at these coordinates.'
                };
            }
        }
        const mosque = new Mosque(mosqueData);
        await mosque.save();
        return { status: 'success', mosque };
    } catch (error) {
        // remove this later
        if (error.code === 11000 && error.keyPattern && error.keyPattern['coordinates.coordinates']) {
            return {
                status: 'failed',
                code: 400,
                message: 'A mosque already exists at these coordinates.'
            };
        }
        console.error('createMosque error:', error);
        return { status: 'failed', code: 500, message: 'Failed to create mosque' };
    }
};

const softDeleteMosque = async (id) => {
    try {
        const mosque = await Mosque.findById(id);
        if (!mosque) {
            return { status: 'failed', code: 404, message: 'Mosque not found' };
        }
        const isAlreadySoftDeleted =
            mosque.isActive === false &&
            mosque.officialMeeqat === null &&
            mosque.meeqatConfig === null &&
            mosque.mosqueMeeqat === null &&
            mosque.contactPerson === null;
        if (isAlreadySoftDeleted) {
            return {
                status: 'success',
                message: 'Mosque is already in a soft delete state.',
                mosque
            };
        }
        // Perform soft delete
        mosque.isActive = false;
        mosque.officialMeeqat = null;
        mosque.meeqatConfig = null;
        mosque.mosqueMeeqat = null;
        mosque.contactPerson = null;
        await mosque.save();
        return {
            status: 'success',
            message: 'Mosque has been successfully soft deleted.',
            mosque
        };
    } catch (error) {
        console.error('softDeleteMosque error:', error);
        return { status: 'failed', code: 500, message: 'Failed to soft delete mosque' };
    }
};

module.exports = {
    getNearbyMosques,
    getMosqueById,
    searchMosques,
    setOfficialMeeqat,
    createMosque,
    softDeleteMosque,
}; 