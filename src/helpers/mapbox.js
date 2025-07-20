const axios = require('axios');

async function getRoutesForMosques(userLocation, mosqueLocations) {
    const apiKey = process.env.MAPBOX_API_KEY;
    const baseUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
    const userLoc = `${userLocation[0]},${userLocation[1]}`;
    const routePromises = mosqueLocations.map(async (mosque) => {
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
            console.log('Mapbox Fetching Error for mosque:', mosque.name, error.message);
        }
        return null;
    });
    return Promise.all(routePromises);
}

module.exports = { getRoutesForMosques }; 