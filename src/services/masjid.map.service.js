const Mosque = require('../models/mosque.model');
const axios = require('axios');

// Fetch mosques within a radius (in km) from given coordinates
async function getNearbyMosques({ latitude, longitude, radius = 2, withRoutes = false }) {
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
            const lat = mosque.coordinates?.coordinates?.[1] ?? null
            const lng = mosque.coordinates?.coordinates?.[0] ?? null
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
}

module.exports = { getNearbyMosques }; 