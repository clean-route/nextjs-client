import getGeojson from '../utils/getGeojson.js'

const API_BASE_URL = process.env.REACT_APP_SERVER_URL

export class RouteService {
    // Get all routes
    static async getAllRoutes(requestBody) {
        const response = await fetch(`${API_BASE_URL}all-routes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        return await response.json()
    }

    // Get single route
    static async getRoute(requestBody) {
        const response = await fetch(`${API_BASE_URL}route`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        return await response.json()
    }

    // Get Mapbox routes (legacy)
    static async getMapboxRoutes(source, destination) {
        const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${source.position[0]},${source.position[1]};${destination.position[0]},${destination.position[1]}?steps=true&geometries=geojson&alternatives=true&waypoints_per_route=true&access_token=${mapboxgl.accessToken}`,
            { method: 'GET' }
        )
        const json = await query.json()
        let routes = json.routes
        routes.forEach((route) => {
            route.time = route.duration * 1000
        })
        return routes
    }

    // Get Graphhopper routes (legacy)
    static async getGraphhopperRoutes(source, destination, temp_mode) {
        const query = await fetch(
            `https://graphhopper.com/api/1/route?point=${source.position[1]},${source.position[0]}&point=${destination.position[1]},${destination.position[0]}&vehicle=${temp_mode}&debug=true&key=${process.env.REACT_APP_GRAPHHOPPER_API_KEY}&type=json&points_encoded=false&algorithm=alternative_route&alternative_route.max_paths=4&alternative_route.max_weight_factor=1.4&alternative_route.max_share_factor=0.6&elevation=true`,
            { method: 'GET' }
        )
        const json = await query.json()
        return json.paths
    }
}

// Route request builder
export const buildRouteRequest = (source, destination, delayCode, mode, routePreference, vehicleMass, vehicleCondition, engineType) => {
    return {
        source: source.position,
        destination: destination.position,
        delayCode: parseInt(delayCode),
        mode: mode === 'car' ? 'driving-traffic' : 'scooter',
        route_preference: routePreference,
        vehicle_mass: parseInt(vehicleMass),
        condition: vehicleCondition,
        engine_type: engineType
    }
}

// Route display helper
export const displayRouteOnMap = (route, start, end, routeId, routeType, displayRoute) => {
    const geojson = getGeojson(route)
    displayRoute(geojson, start, end, routeId, routeType)
}

// Route data extractor
export const extractRouteData = (route, mode) => {
    if (mode === 'scooter') {
        return {
            time: route.time,
            instructions: route.instructions,
            distance: route.distance,
            exposure: route.total_exposure
        }
    } else {
        return {
            time: route.duration,
            instructions: route.legs[0].steps,
            distance: route.distance,
            exposure: route.total_exposure
        }
    }
} 