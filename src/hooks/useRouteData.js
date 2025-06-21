import { useState } from 'react'
import { RouteService, buildRouteRequest, displayRouteOnMap, extractRouteData } from '../services/routeService.js'

export const useRouteData = () => {
    // Route data state
    const [distance, setDistance] = useState(0)
    const [time, setTime] = useState(0)
    const [exposure, setExposure] = useState(0)
    const [instructions, setInstructions] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    // Individual route states
    const [shortestRoute, setShortestRoute] = useState({})
    const [fastestRoute, setFastestRoute] = useState({})
    const [leapRoute, setLeapRoute] = useState({})
    const [balancedRoute, setBalancedRoute] = useState({})
    const [leastCarbonRoute, setLeastCarbonRoute] = useState({})

    // Clear all routes from map
    const clearRoutesFromMap = () => {
        let layers = window.$map.getStyle().layers
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].id.includes('-route')) {
                window.$map.removeLayer(layers[i].id)
                window.$map.removeSource(layers[i].id)
            }
        }
    }

    // Handle single route
    const handleSingleRoute = async (source, destination, delayCode, mode, routePreference, vehicleMass, vehicleCondition, engineType, displayRoute) => {
        setIsLoading(true)
        
        try {
            const requestBody = buildRouteRequest(source, destination, delayCode, mode, routePreference, vehicleMass, vehicleCondition, engineType)
            const route = await RouteService.getRoute(requestBody)
            
            const routeData = extractRouteData(route, mode)
            setDistance(routeData.distance)
            setTime(routeData.time)
            setInstructions(routeData.instructions)
            setExposure(routeData.exposure)

            // Clear existing routes and display new one
            clearRoutesFromMap()
            
            const routeId = `${mode}-${routePreference}-${source.position[0]}-${source.position[1]}-${destination.position[0]}-${destination.position[1]}-route`
            displayRouteOnMap(route, source, destination, routeId, routePreference, displayRoute)

            // Update specific route state
            switch (routePreference) {
                case 'shortest':
                    setShortestRoute(route)
                    break
                case 'fastest':
                    setFastestRoute(route)
                    break
                case 'leap':
                    setLeapRoute(route)
                    break
                case 'emission':
                    setLeastCarbonRoute(route)
                    break
                case 'balanced':
                    setBalancedRoute(route)
                    break
            }
        } catch (error) {
            console.error('Error fetching route:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle all routes
    const handleAllRoutes = async (source, destination, delayCode, mode, routePreference, vehicleMass, vehicleCondition, engineType, displayRoute) => {
        setIsLoading(true)
        
        try {
            const requestBody = buildRouteRequest(source, destination, delayCode, mode, routePreference, vehicleMass, vehicleCondition, engineType)
            const routeList = await RouteService.getAllRoutes(requestBody)

            // Clear existing routes
            clearRoutesFromMap()

            // Display each route
            const routes = [
                { route: routeList.shortest, type: 'shortest', setter: setShortestRoute },
                { route: routeList.fastest, type: 'fastest', setter: setFastestRoute },
                { route: routeList.leap_graphhopper, type: 'leap', setter: setLeapRoute },
                { route: routeList.lco2_graphhopper, type: 'emission', setter: setLeastCarbonRoute },
                { route: routeList.balanced, type: 'balanced', setter: setBalancedRoute }
            ]

            routes.forEach(({ route, type, setter }) => {
                if (route) {
                    setter(route)
                    const routeId = `${mode}-${routePreference}-${source.position[0]}-${source.position[1]}-${destination.position[0]}-${destination.position[1]}-route-all-${type}`
                    displayRouteOnMap(route, source, destination, routeId, type, displayRoute)
                }
            })
        } catch (error) {
            console.error('Error fetching all routes:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Main route handler
    const getRoutes = async (source, destination, delayCode, mode, routePreference, vehicleMass, vehicleCondition, engineType, displayRoute) => {
        if (!source || !destination) return

        if (routePreference === 'all') {
            await handleAllRoutes(source, destination, delayCode, mode, routePreference, vehicleMass, vehicleCondition, engineType, displayRoute)
        } else {
            await handleSingleRoute(source, destination, delayCode, mode, routePreference, vehicleMass, vehicleCondition, engineType, displayRoute)
        }
    }

    return {
        // State
        distance,
        time,
        exposure,
        instructions,
        isLoading,
        shortestRoute,
        fastestRoute,
        leapRoute,
        balancedRoute,
        leastCarbonRoute,
        
        // Actions
        getRoutes,
        setIsLoading,
        clearRoutesFromMap
    }
} 