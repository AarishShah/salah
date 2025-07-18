const Mosque = require('../models/mosque.model');
const axios = require('axios');

// Fetch masjids within a radius (in km) from given coordinates
async function getNearbyMasjids({ latitude, longitude, radius = 2, withRoutes = false }) {
    // Convert radius to meters
    const radiusMeters = radius * 1000;
    // MongoDB expects [lng, lat]
    const userLocation = [longitude, latitude];
    
    const fetchLimit = 3; // Adjust Later

    // Find masjids within radius, sorted by distance, limit 10
    const masjids = await Mosque.aggregate([
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

    let masjidsResult = masjids.map(masjid => ({
        name: masjid.name,
        sect: masjid.sect,
        address: masjid.address,
        locality: masjid.locality,
        contactPerson: masjid.contactPerson,
        coordinates: {
            latitude: masjid.coordinates?.coordinates?.[1] ?? null,
            longitude: masjid.coordinates?.coordinates?.[0] ?? null
        },
        displacement: masjid.displacement,
        route: null
    }));

    if (withRoutes && process.env.MAPBOX_API_KEY && masjids.length > 0) {
        // Fetch routes in parallel for each masjid
        const apiKey = process.env.MAPBOX_API_KEY;
        const baseUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
        const userLoc = `${longitude},${latitude}`;
        const routePromises = masjids.map(async (masjid) => {
            const lat = masjid.coordinates?.coordinates?.[1] ?? null
            const lng = masjid.coordinates?.coordinates?.[0] ?? null
            if (lng == null || lat == null) return null;
            const masjidLoc = `${lng},${lat}`;
            const url = `${baseUrl}/${userLoc};${masjidLoc}?geometries=polyline&access_token=${apiKey}`;
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
            } catch (e) {
                console.log("Mapbox Fetching Error for masjid:", masjid.name, e.message);
            }
            return null;
        });
        const routes = await Promise.all(routePromises);
        masjidsResult = masjidsResult.map((masjid, idx) => ({
            ...masjid,
            route: routes[idx]
        }));
    }

    return {
        status: 'success',
        masjids: masjidsResult
    };
}

module.exports = { getNearbyMasjids }; 