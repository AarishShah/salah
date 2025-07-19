const Mosque = require('../models/mosque.model');
const axios = require('axios');

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
            // Fetch routes in parallel for each mosque
            const apiKey = process.env.MAPBOX_API_KEY;
            const baseUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
            const userLoc = `${longitude},${latitude}`;
            const routePromises = mosques.map(async (mosque) => {
                const lat = mosque.coordinates?.coordinates?.[1] ?? null;
                const lng = mosque.coordinates?.coordinates?.[0] ?? null;
                if (lng == null || lat == null) return null;
                const mosqueLoc = `${lng},${lat}`;
                const url = `${baseUrl}/${userLoc};${mosqueLoc}?geometries=polyline&access_token=${apiKey}`;
                try {
                    const res = await axios.get(url);
                    const route = res.data.routes && res.data.routes[0];
                    if (route) {
                        return {
                            geometry: route.geometry,
                            duration: route.duration,
                            distance: route.distance
                        };
                    }
                } catch (error) {
                    console.log("Mapbox Fetching Error for mosque:", mosque.name, error.message);
                }
                return null;
            });
            const routes = await Promise.all(routePromises);
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

const getMosqueById = async (id) => {
    try {
        const mosque = await Mosque.findById(id);
        if (!mosque) {
            return { status: 'failed', code: 404, message: 'Mosque not found' };
        }
        return { status: 'success', mosque };
    } catch (error) {
        console.error('getMosqueById error:', error);
        return { status: 'failed', code: 500, message: 'Failed to fetch mosque' };
    }
};

const searchMosques = async (query) => {
    try {
        const { name, sect, locality } = query;
        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (sect) filter.sect = sect;
        if (locality) filter.locality = { $regex: locality, $options: 'i' };
        const mosques = await Mosque.find(filter);
        return { status: 'success', mosques };
    } catch (error) {
        console.error('searchMosques error:', error);
        return { status: 'failed', code: 500, message: 'Failed to search mosques' };
    }
};

const getEditorAssignedMosques = async (userId) => {
    try {
        // Assuming User model has assignedMosques
        const User = require('../models/user.model');
        const user = await User.findById(userId).populate('assignedMosques');
        if (!user) {
            return { status: 'failed', code: 404, message: 'User not found' };
        }
        return { status: 'success', mosques: user.assignedMosques };
    } catch (error) {
        console.error('getEditorAssignedMosques error:', error);
        return { status: 'failed', code: 500, message: 'Failed to fetch assigned mosques' };
    }
};

const getAllMosques = async () => {
    try {
        const mosques = await Mosque.find();
        return { status: 'success', mosques };
    } catch (error) {
        console.error('getAllMosques error:', error);
        return { status: 'failed', code: 500, message: 'Failed to fetch all mosques' };
    }
};

const createMosque = async (data) => {
    try {
        const mosque = new Mosque(data);
        await mosque.save();
        return { status: 'success', mosque };
    } catch (error) {
        console.error('createMosque error:', error);
        return { status: 'failed', code: 500, message: 'Failed to create mosque' };
    }
};

const updateMosque = async (id, data, user) => {
    try {
        // Optionally, check user permissions here
        const mosque = await Mosque.findByIdAndUpdate(id, data, { new: true });
        if (!mosque) {
            return { status: 'failed', code: 404, message: 'Mosque not found' };
        }
        return { status: 'success', mosque };
    } catch (error) {
        console.error('updateMosque error:', error);
        return { status: 'failed', code: 500, message: 'Failed to update mosque' };
    }
};

const deleteMosque = async (id) => {
    try {
        const mosque = await Mosque.findByIdAndDelete(id);
        if (!mosque) {
            return { status: 'failed', code: 404, message: 'Mosque not found' };
        }
        return { status: 'success', mosque };
    } catch (error) {
        console.error('deleteMosque error:', error);
        return { status: 'failed', code: 500, message: 'Failed to delete mosque' };
    }
};

module.exports = {
    getNearbyMosques,
    getMosqueById,
    searchMosques,
    getEditorAssignedMosques,
    getAllMosques,
    createMosque,
    updateMosque,
    deleteMosque,
}; 