import { useState, useEffect } from 'react'
import useInput from './useInput.js'
import prettyMilliseconds from 'pretty-ms'
import Instruction from './Instruction.js'
import getRouteColor from '../utils/getRouteColor.js'
import getIconFromMode from '../utils/getIconFromMode.js'
const prettyMetric = require('pretty-metric')
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')
import getGeojson from '../utils/getGeojson'

export default function MapDrawer() {
    // Drawer
    const [isExpanded, setIsExpanded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showColorInfo, setShowColorInfo] = useState(true)

    // Form
    const source = useInput('') //custom hook
    const destination = useInput('')
    const [mode, setMode] = useState('')
    const [vehicleMass, setVehicleMass] = useState('')
    const [vehicleCondition, setVehicleCondition] = useState('')
    const [engineType, setEngineType] = useState('')
    const [routePreference, setRoutePreference] = useState('')
    const [delayCode, setDelayCode] = useState(null)
    const [distance, setDistance] = useState(0)
    const [time, setTime] = useState(0)
    const [exposure, setExposure] = useState(0)
    const [instructions, setInstructions] = useState([])

    // Type of Routes
    const [shortestRoute, setShortestRoute] = useState({})
    const [fastestRoute, setFastestRoute] = useState({})
    const [leapRoute, setLeapRoute] = useState({})
    const [balancedRoute, setBalancedRoute] = useState({})
    const [leastCarbonRoute, setLeastCarbonRoute] = useState({})

    // Map
    // Initial Location

    let position = [0, 0] // map start location.
    useEffect(() => {
        if (process.env.MAPBOX_API_KEY === 'undefined') {
            console.error(
                'Mapbox API Key is not set. Please set it in .env file.'
            )
            return
        }
        setupMap({ position: position, placeName: 'Default Location' })
    }, [])

    // Reset vehicle mass when mode changes
    useEffect(() => {
        setVehicleMass('')
    }, [mode])

    //--------------- Initializes the map object globally-------------------
    // Renders the map on the screen
    function setupMap({ position, placeName, locationType = 'default' }) {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY
        // console.log(`Position inside the setupMap is: ${position}`)
        window.$map = new mapboxgl.Map({
            container: 'map-container',
            // style: 'mapbox://styles/saditya9211/clbw1qkuo000u15o2afjcpknz',
            style: 'mapbox://styles/saditya9211/clky9t1r1006m01qsaki0c8nz',
            center: position,
            zoom: 9,
            // boxZoom: true,
            doubleClickZoom: true,
            // hash: true,
        }).fitBounds(
            [
                [67.77384991, 10.27430903], // southwest coordinates for india
                [98.44100523, 36.45878352], // northeast coordinates for india
            ],
            {
                padding: 10, // padding around the map area - extra area of map around fitBounds in some units
            }
        )
        //adding the marker to the map if the location is source or destination
        if (locationType == 'source') {
            addMarkerToMap({ position, placeName, locationType })
        } else if (locationType == 'destination') {
            addMarkerToMap({ position, placeName, locationType })
        }

        //add navigation control
        window.$map.addControl(
            new mapboxgl.NavigationControl({
                visualizePitch: true,
            }),
            'bottom-right'
        )

        // Adding Geolocation Marker - to show the user's location
        window.$map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
            })
        )
        //Scale Control
        const scale = new mapboxgl.ScaleControl({
            maxWidth: 80,
            unit: 'metric',
        })
        window.$map.addControl(scale, 'bottom-left')

        // Set marker options.
    }

    // adding marker to the map
    function addMarkerToMap({ position, placeName, locationType = 'default' }) {
        // if the marker at that location already exists
        if (
            window.$map.getLayer(
                `${position[0]}-${position[1]}-${locationType}-marker`
            )
        ) {
            // remove the marker layer
            // window.$map.removeLayer(`${position[0]}-${position[1]}-${locationType}-marker`)
            console.log('Removing the layer as it exits..')
        }
        console.log('coming out alive')
        window.$map.on('style.load', function () {
            console.log('not entering here...')
            const icon = getIconFromMode({ mode, locationType })
            icon.onload = function () {
                try {
                    window.$map.addImage(
                        `${mode}-${routePreference}-${position[0]}-${position[1]}`,
                        icon
                    )
                } catch (e) {
                    console.error(e)
                }
                window.$map.addLayer({
                    id: `${position[0]}-${position[1]}-${locationType}-marker`,
                    type: 'symbol',
                    source: {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: position,
                            },
                            properties: {
                                title: `${placeName}`,
                            },
                        },
                    },

                    layout: {
                        'icon-image': `${mode}-${routePreference}-${position[0]}-${position[1]}`,
                        'icon-size': 0.12,
                    },
                })
            }
        })

        //popup is by default open
        new mapboxgl.Popup()
            .setLngLat(position)
            .setHTML(`<h3 color: "black"><strong>${placeName}</strong></h3>`)
            .addTo(window.$map)

        //popup on clicking the marker
        window.$map.on(
            'click',
            `${position[0]}-${position[1]}-${locationType}-marker`,
            function (e) {
                const coordinates = e.features[0].geometry.coordinates.slice()
                // var description = e.features[0].properties.description
                const title = e.features[0].properties.title
                console.log(title)
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
                }
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(title)
                    .addTo(window.$map)
            }
        )
    }

    function displayRoute(geojson, start, end, routeId, tempRoutePreference) {
        //adding the source and destination markers found in the route
        //start marker

        //Just displays a route on the map without removing any other route.
        window.$map.addLayer({
            id: routeId,
            // id: 'route',
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson,
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
            },
            paint: {
                'line-color': getRouteColor(tempRoutePreference),
                'line-width': 6,
                'line-opacity': 0.65,
            },
        })

        const minLng = Math.min(start.position[0], end.position[0])
        const maxLng = Math.max(start.position[0], end.position[0])
        const minLat = Math.min(start.position[1], end.position[1])
        const maxLat = Math.max(start.position[1], end.position[1])

        window.$map.fitBounds(
            [
                [minLng, minLat], // Southwest coordinates
                [maxLng, maxLat], // Northeast coordinates
            ],
            {
                padding: 100,
            }
        )
    }

    async function getMapboxRoutes() {
        console.log('Calling Mapbox API...')
        const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${source.position[0]},${source.position[1]};${destination.position[0]},${destination.position[1]}?steps=true&geometries=geojson&alternatives=true&waypoints_per_route=true&access_token=${mapboxgl.accessToken}`,
            { method: 'GET' }
        )
        const json = await query.json()
        let routes = json.routes
        routes.forEach((route) => {
            route.time = route.duration * 1000
        }) // normalizing the arguments
        return routes
    }

    async function getGraphhopperRoutes(temp_mode) {
        console.log('Calling Graphhopper API...')
        const query = await fetch(
            `https://graphhopper.com/api/1/route?point=${source.position[1]},${source.position[0]}&point=${destination.position[1]},${destination.position[0]}&vehicle=${temp_mode}&debug=true&key=${process.env.REACT_APP_GRAPHHOPPER_API_KEY}&type=json&points_encoded=false&algorithm=alternative_route&alternative_route.max_paths=4&alternative_route.max_weight_factor=1.4&alternative_route.max_share_factor=0.6&elevation=true`,
            { method: 'GET' }
        )
        const json = await query.json()
        const routes = json.paths
        return routes
    }

    async function getAllRoutes(start, end) {
        //Handle the all routes cases - default case

        console.log('Inside getAllRoutes...')

        // removing all the other routes
        let layers = window.$map.getStyle().layers
        console.log({ layers })
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].id.includes('-route')) {
                window.$map.removeLayer(layers[i].id)
                window.$map.removeSource(layers[i].id)
            }
        }

        let geojson, routeList, routeId

        // getting all the routes
        const body = {
            source: source.position,
            destination: destination.position,
            delayCode: parseInt(delayCode),
            mode: mode === 'car' ? 'driving-traffic' : 'scooter',
            route_preference: routePreference,
            vehicle_mass: parseInt(vehicleMass),
            condition: vehicleCondition,
            engine_type: engineType
        }

        console.log("request body: ", body)

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),

        }

        const response = await fetch(
            process.env.REACT_APP_SERVER_URL + 'all-routes',
            requestOptions
        )
        routeList = await response.json()

        console.log('Route found: ', routeList)

        // Shortest - Graphhopper
        console.log('shortest', routeList.shortest)
        geojson = getGeojson(routeList.shortest)
        routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route-all-shortest`
        setShortestRoute(routeList.shortest)
        if (window.$map.getSource(routeId)) {
            console.log('changing the route source data...')
            window.$map.getSource(routeId).setData(geojson)
        } else {
            console.log('displaying a new route...')
            displayRoute(geojson, start, end, routeId, 'shortest')
        }

        // Leap - Graphhopper
        console.log('Leap route: ', routeList.leap_graphhopper)
        geojson = getGeojson(routeList.leap_graphhopper)
        routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route-all-leap`
        setLeapRoute(routeList.leap_graphhopper)
        if (window.$map.getSource(routeId)) {
            console.log('changing the route source data...')
            window.$map.getSource(routeId).setData(geojson)
        } else {
            console.log('displaying a new route...')
            displayRoute(geojson, start, end, routeId, 'leap')
        }

        // Lco2 - Graphhopper
        console.log('Emision Route: ', routeList.lco2_graphhopper)
        geojson = getGeojson(routeList.lco2_graphhopper)
        routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route-all-emission`
        setLeastCarbonRoute(routeList.lco2_graphhopper)
        if (window.$map.getSource(routeId)) {
            console.log('changing the route source data...')
            window.$map.getSource(routeId).setData(geojson)
        } else {
            console.log('displaying a new route...')
            displayRoute(geojson, start, end, routeId, 'emission')
        }

        // if (mode == 'driving-traffic' || mode == "scooter") {
        // Balanced and Fastest
        // Display Fastest Route: Mapbox
        console.log('Fastest: ', routeList.fastest)
        geojson = getGeojson(routeList.fastest)
        routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route-all-fastest`
        setFastestRoute(routeList.fastest)
        if (window.$map.getSource(routeId)) {
            console.log('changing the route source data...')
            window.$map.getSource(routeId).setData(geojson)
        } else {
            console.log('displaying a new route...')
            displayRoute(geojson, start, end, routeId, 'fastest')
        }

        // Displaying the Balanced Route
        console.log('Balanced Route: ', routeList.balanced)
        geojson = getGeojson(routeList.balanced)
        routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route-all-balanced`
        setBalancedRoute(routeList.balanced)
        if (window.$map.getSource(routeId)) {
            console.log('changing the route source data...')
            window.$map.getSource(routeId).setData(geojson)
        } else {
            console.log('displaying a new route...')
            displayRoute(geojson, start, end, routeId, 'balanced')
        }
        // } else if (mode == 'scooter') {
        //     // Balanced and Fastest

        // }
    }

    // Fetches the route and displays it in the map
    const getRoutes = async (start, end) => {
        if (start != '' && end != '') {
            console.log(
                'Running getRoutes... with mode: ' +
                mode +
                ' and routePreference: ' +
                routePreference
            )
            try {
                console.log('Before query...')

                let geojson
                let layers
                let routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route`
                let body, requestOptions, response, route
                // let temp_routes = routes
                // let shortestRouteTime

                switch (routePreference) {
                    case 'shortest':
                        // Always the Graphhopper Route
                        console.log('Shortest Path...')

                        // Getting the shortest route
                        body = {
                            source: source.position,
                            destination: destination.position,
                            delayCode: parseInt(delayCode),
                            mode: mode === 'car' ? 'driving-traffic' : 'scooter',
                            route_preference: 'shortest',
                            vehicle_mass: parseInt(vehicleMass),
                            condition: vehicleCondition,
                            engine_type: engineType
                        }
                        console.log("request body: ", body)

                        requestOptions = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(body),
                        }

                        response = await fetch(
                            process.env.REACT_APP_SERVER_URL + 'route',
                            requestOptions
                        )
                        route = await response.json()

                        console.log('Route found: ', route)

                        geojson = getGeojson(route)
                        setDistance(route.distance)
                        setTime(route.time)
                        // console.log(route.instructions)
                        setInstructions(route.instructions)
                        setExposure(route.total_exposure)
                        setShortestRoute(route)

                        // display this map
                        // removing all the layers and sources from the map before adding the shortest route
                        // we can also make the visibility property - 'none'
                        layers = window.$map.getStyle().layers
                        for (let i = 0; i < layers.length; i++) {
                            if (layers[i].id.includes('-route')) {
                                window.$map.removeLayer(layers[i].id)
                                window.$map.removeSource(layers[i].id)
                            }
                        }

                        routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route`
                        if (window.$map.getSource(routeId)) {
                            window.$map.getSource(routeId).setData(geojson)

                            setIsLoading(false)
                        } else {
                            // This is how we define the id of the route.
                            displayRoute(
                                geojson,
                                start,
                                end,
                                routeId,
                                'shortest'
                            )
                            setIsLoading(false)
                        }
                        break

                    case 'fastest':
                        console.log('Fastest Path...')
                        // Getting the Fastest route
                        body = {
                            source: source.position,
                            destination: destination.position,
                            delayCode: parseInt(delayCode),
                            mode: mode === 'car' ? 'driving-traffic' : 'scooter',
                            route_preference: 'fastest',
                            vehicle_mass: parseInt(vehicleMass),
                            condition: vehicleCondition,
                            engine_type: engineType
                        }

                        requestOptions = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(body),
                        }

                        response = await fetch(
                            process.env.REACT_APP_SERVER_URL + 'route',
                            requestOptions
                        )
                        route = await response.json()
                        geojson = getGeojson(route)

                        // Type of Routes
                        if (mode == 'scooter') {
                            // Scooter Route - fastest: Graphhopper Route
                            setTime(route.time)
                            setInstructions(route.instructions)
                        } else {
                            // Car Route - fastest: Driving Traffic: Mapbox Route
                            setTime(route.duration)
                            console.log('Route Duration: ', route.duration)
                            setInstructions(route.legs[0].steps)
                        }
                        setDistance(route.distance)
                        setExposure(route.total_exposure)
                        setFastestRoute(route)

                        //removing all the routes from map
                        layers = window.$map.getStyle().layers
                        for (let i = 0; i < layers.length; i++) {
                            if (layers[i].id.includes('-route')) {
                                window.$map.removeLayer(layers[i].id)
                                window.$map.removeSource(layers[i].id)
                            }
                        }

                        routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route`
                        if (window.$map.getSource(routeId)) {
                            window.$map.getSource(routeId).setData(geojson)
                        } else {
                            displayRoute(
                                geojson,
                                start,
                                end,
                                routeId,
                                'fastest'
                            )
                        }
                        setIsLoading(false)
                        break

                    case 'leap':
                        // Always the Graphhopper Route
                        console.log('LEAP Path...')
                        // Getting the leap route
                        body = {
                            source: source.position,
                            destination: destination.position,
                            delayCode: parseInt(delayCode),
                            mode: mode === 'car' ? 'driving-traffic' : 'scooter',
                            route_preference: 'leap',
                            vehicle_mass: parseInt(vehicleMass),
                            condition: vehicleCondition,
                            engine_type: engineType
                        }

                        requestOptions = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(body),
                        }

                        response = await fetch(
                            process.env.REACT_APP_SERVER_URL + 'route',
                            requestOptions
                        )
                        route = await response.json()

                        geojson = getGeojson(route)
                        setDistance(route.distance)
                        setTime(route.time)
                        setInstructions(route.instructions)
                        setExposure(route.total_exposure)
                        setLeapRoute(route)

                        // // estimating the time for leap route
                        // temp_routes.sort((a, b) => a.distance - b.distance) //shorting based on distance
                        // shortestRouteTime = temp_routes[0].time
                        // shortestRouteDistance = temp_routes[0].distance

                        // // routes[0].time =
                        //     (routes[0].distance / shortestRouteDistance) *
                        //     shortestRouteTime

                        // display this map
                        // removing all the layers and sources from the map before adding the shortest route
                        // we can also make the visibility property - 'none'
                        layers = window.$map.getStyle().layers
                        for (let i = 0; i < layers.length; i++) {
                            if (layers[i].id.includes('-route')) {
                                window.$map.removeLayer(layers[i].id)
                                window.$map.removeSource(layers[i].id)
                            }
                        }

                        routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route`
                        if (window.$map.getSource(routeId)) {
                            window.$map.getSource(routeId).setData(geojson)
                        } else {
                            // This is how we define the id of the route.
                            displayRoute(geojson, start, end, routeId, 'leap')
                        }
                        setIsLoading(false)
                        break

                    // console.log('LEAP Path...') //get the routes from the graphhopper api  ✅

                    // //ignoring the traffic in case of the greenest route.
                    // ;({ geojson, routes } = await getLeapRoute(
                    //     routes,
                    //     temp_mode
                    // ))

                    // setDistance(routes[0].distance)

                    // // estimating the time for leap route
                    // temp_routes.sort((a, b) => a.distance - b.distance) //shorting based on distance
                    // shortestRouteTime = temp_routes[0].time
                    // shortestRouteDistance = temp_routes[0].distance

                    // routes[0].time =
                    //     (routes[0].distance / shortestRouteDistance) *
                    //     shortestRouteTime
                    // setTime(routes[0].time)
                    // setInstructions(routes[0].instructions)

                    // //removing all the other routes
                    // layers = window.$map.getStyle().layers
                    // console.log({ layers })
                    // for (let i = 0; i < layers.length; i++) {
                    //     if (layers[i].id.includes('-route')) {
                    //         window.$map.removeLayer(layers[i].id)
                    //         window.$map.removeSource(layers[i].id)
                    //     }
                    // }
                    // setExposure(routes[0].total_exposure)
                    // routeId = `${temp_mode}-${temp_routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route`
                    // //if same route is present - then we modify its source
                    // if (window.$map.getSource(routeId)) {
                    //     window.$map.getSource(routeId).setData(geojson)
                    //     setLeapRoute(routes[0])
                    //     setIsLoading(false)
                    // } else {
                    //     displayRoute(geojson, start, end, routeId, 'leap')
                    //     setLeapRoute(routes[0])
                    //     setIsLoading(false)
                    // }
                    // console.log('Leap Route displayed...')
                    // break

                    case 'balanced':
                        // Similar to Fastest Path: Mapbox / Graphhopper
                        console.log('Fastest Path...')
                        // Getting the Fastest route
                        body = {
                            source: source.position,
                            destination: destination.position,
                            delayCode: parseInt(delayCode),
                            mode: mode === 'car' ? 'driving-traffic' : 'scooter',
                            route_preference: 'balanced',
                            vehicle_mass: parseInt(vehicleMass),
                            condition: vehicleCondition,
                            engine_type: engineType
                        }

                        requestOptions = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(body),
                        }

                        response = await fetch(
                            process.env.REACT_APP_SERVER_URL + 'route',
                            requestOptions
                        )
                        route = await response.json()
                        geojson = getGeojson(route)

                        // Type of Routes
                        if (mode == 'scooter') {
                            // Scooter Route - balanced: Graphhopper Route
                            setTime(route.time)
                            setInstructions(route.instructions)
                        } else {
                            // Car Route - balanced: driving-traffic: Mapbox Route
                            setTime(route.duration)
                            setInstructions(route.legs[0].steps)
                        }
                        setDistance(route.distance)
                        setExposure(route.total_exposure)
                        setBalancedRoute(route)

                        //removing all the routes from map
                        layers = window.$map.getStyle().layers
                        for (let i = 0; i < layers.length; i++) {
                            if (layers[i].id.includes('-route')) {
                                window.$map.removeLayer(layers[i].id)
                                window.$map.removeSource(layers[i].id)
                            }
                        }

                        routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route`
                        if (window.$map.getSource(routeId)) {
                            window.$map.getSource(routeId).setData(geojson)
                        } else {
                            displayRoute(
                                geojson,
                                start,
                                end,
                                routeId,
                                'balanced'
                            )
                        }
                        setIsLoading(false)
                        console.log('Balanced Route Displayed...')
                        break

                    case 'emission':
                        // Always the Graphhopper Route
                        console.log('Least Emission Path...')

                        // Getting the lco2 route
                        body = {
                            source: source.position,
                            destination: destination.position,
                            delayCode: parseInt(delayCode),
                            mode: mode === 'car' ? 'driving-traffic' : 'scooter',
                            route_preference: 'emission',
                            vehicle_mass: parseInt(vehicleMass),
                            condition: vehicleCondition,
                            engine_type: engineType
                        }

                        requestOptions = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(body),
                        }

                        response = await fetch(
                            process.env.REACT_APP_SERVER_URL + 'route',
                            requestOptions
                        )
                        route = await response.json()

                        geojson = getGeojson(route)
                        setDistance(route.distance)
                        setTime(route.time)
                        setInstructions(route.instructions)
                        setExposure(route.total_exposure)
                        setLeastCarbonRoute(route)

                        // display this map
                        // removing all the layers and sources from the map before adding the shortest route
                        // we can also make the visibility property - 'none'
                        layers = window.$map.getStyle().layers
                        for (let i = 0; i < layers.length; i++) {
                            if (layers[i].id.includes('-route')) {
                                window.$map.removeLayer(layers[i].id)
                                window.$map.removeSource(layers[i].id)
                            }
                        }

                        routeId = `${mode}-${routePreference}-${start.position[0]}-${start.position[1]}-${end.position[0]}-${end.position[1]}-route`
                        if (window.$map.getSource(routeId)) {
                            window.$map.getSource(routeId).setData(geojson)

                            setIsLoading(false)
                        } else {
                            // This is how we define the id of the route.
                            displayRoute(
                                geojson,
                                start,
                                end,
                                routeId,
                                'shortest'
                            )
                            setIsLoading(false)
                        }
                        break
                }
            } catch (e) {
                setIsLoading(false)
                console.log(e)
            }
        }
    }
    return (
        <div className="drawer">
            <input
                id="my-drawer"
                type="checkbox"
                className="drawer-toggle"
                onClick={() => {
                    setIsExpanded(!isExpanded)
                }}
            />

            <div className="drawer-content">
                <label
                    htmlFor="my-drawer"
                    className="btn drawer-button btn-secondary btn-sm right-12 top-2  absolute z-40"
                >
                    {isExpanded ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
                            />
                        </svg>
                    )}
                </label>
                <div>
                    <div className="w-screen abosolute -z-30 mr-5">
                        <div
                            id="map-container"
                            className="h-screen w-full"
                        ></div>
                    </div>
                </div>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer" className="drawer-overlay"></label>
                <div
                    className={'menu p-4 bg-base-100 w-10/12 md:w-1/3 lg:w-1/4'}
                >
                    <h1 className="text-lg font-semibold title-font text-center border-b-2 pb-2 mx-auto mb-4">
                        Air Pollution Routing - IIT KGP
                    </h1>
                    <form>
                        <div className="flex flex-col space-y-3 items-center">

                            {/* 1. Mode of Transport */}
                            <select
                                className="select select-sm select-bordered w-full max-w-xs text-center"
                                required
                                value={mode}
                                onChange={(e) => {
                                    setMode(e.target.value)
                                    console.log(e.target.value)
                                }}
                            >
                                <option
                                    disabled
                                    value=""
                                    selected
                                    className="text-center"
                                >
                                    -- Select Mode of Transport --
                                </option>
                                <option value="car">Car</option>
                                <option value="two-wheeler">Two Wheeler</option>
                            </select>

                            {/* 2. Vehicle Mass */}
                            <div className="w-full max-w-xs">
                                <input
                                    type="number"
                                    placeholder="Enter Vehicle Mass (kg)"
                                    className="input input-sm input-bordered mt-0 w-full"
                                    value={vehicleMass}
                                    onChange={(e) => setVehicleMass(e.target.value)}
                                    min={mode === 'car' ? 800 : 100}
                                    max={mode === 'car' ? 3000 : 300}
                                    required
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {mode === 'car' ? 'Range: 800-3000 kg' : mode === 'two-wheeler' ? 'Range: 100-300 kg' : 'Select mode first'}
                                </div>
                            </div>

                            {/* 3. Vehicle Condition */}
                            <select
                                className="select select-sm select-bordered w-full max-w-xs"
                                required
                                value={vehicleCondition}
                                onChange={(e) => setVehicleCondition(e.target.value)}
                            >
                                <option value="" disabled>Select Vehicle Condition</option>
                                <option value="okay">Okay (10+ years)</option>
                                <option value="average">Average (5+ years)</option>
                                <option value="good">Good (2 years)</option>
                                <option value="new">New (recently bought)</option>
                            </select>

                            {/* 4. Engine Type */}
                            <select
                                className="select select-sm select-bordered w-full max-w-xs"
                                required
                                value={engineType}
                                onChange={(e) => setEngineType(e.target.value)}
                            >
                                <option value="" disabled>Select Engine Type</option>
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="cng">CNG</option>
                                <option value="ev">EV</option>
                            </select>

                            {/* 5. Route Preference */}
                            <div className="w-full max-w-xs">
                                <div className="flex items-center gap-2">
                                    <select
                                        className="select select-sm select-bordered flex-1"
                                        required
                                        value={routePreference}
                                        onChange={(e) => {
                                            setRoutePreference(e.target.value)
                                            console.log(e.target.value)
                                        }}
                                    >
                                        <option disabled value="">
                                            -- Select Route Preference --
                                        </option>
                                        <option value="shortest">
                                            Shortest (Distance)
                                        </option>
                                        <option value="fastest">
                                            Fastest (Time)
                                        </option>
                                        <option value="leap">
                                            LEAP (exposure)
                                        </option>
                                        <option value="emission">
                                            LCO2 (emission)
                                        </option>
                                        <option value="balanced">
                                            Suggested (recommended)
                                        </option>
                                        <option value="all">All</option>
                                    </select>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer"
                                        onClick={() => {
                                            setShowColorInfo(!showColorInfo)
                                            console.log('click registered')
                                        }}
                                        title="Click to show/hide route color legend"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                                        />
                                    </svg>
                                </div>
                                {showColorInfo && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                        <div className="text-xs text-gray-600 mb-1">Route Colors:</div>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-shortest rounded-full"></div>
                                                <span className="text-xs">Shortest</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-fastest rounded-full"></div>
                                                <span className="text-xs">Fastest</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-leap rounded-full"></div>
                                                <span className="text-xs">LEAP</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-emission rounded-full"></div>
                                                <span className="text-xs">LCO2</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-balanced rounded-full"></div>
                                                <span className="text-xs">Suggested</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 6. Depart Time */}
                            <select
                                className="select select-sm select-bordered w-full max-w-xs"
                                required
                                value={delayCode}
                                onChange={(e) => {
                                    setDelayCode(e.target.value)
                                    console.log(e.target.value)
                                }}
                            >
                                <option
                                    disabled
                                    value="none"
                                    selected
                                    className="text-center"
                                >
                                    -- Depart at --
                                </option>
                                <option value="0"> Now </option>
                                <option value="1">+ 1 hrs</option>
                                <option value="2">+ 2 hrs</option>
                                <option value="3">+ 3 hrs</option>
                                <option value="4">+ 4 hrs</option>
                                <option value="5">+ 5 hrs</option>
                                <option value="6">+ 6 hrs</option>
                            </select>

                            {/* Source and Destination */}
                            <input
                                type="text"
                                placeholder="Enter Source"
                                className="input input-sm input-bordered mt-0 w-full max-w-xs"
                                required
                                {...source}
                                value={source.value}
                            />
                            <div>
                                {source.suggestions?.length > 0 && (
                                    <div
                                        name="suggestion-wrapper"
                                        className="bg-gray-600 text-white absolute right-0 w-11/12 border rounded-md z-50"
                                    >
                                        {source.suggestions.map(
                                            (suggestion, index) => {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="hover:cursor-pointer max-w-sm border-b-2 border-gray-400 p-2"
                                                        onClick={() => {
                                                            console.log(
                                                                suggestion.center
                                                            )
                                                            source.setValue(
                                                                suggestion.text
                                                            )
                                                            source.setPosition(
                                                                suggestion.center
                                                            )
                                                            source.setSuggestions(
                                                                []
                                                            )
                                                            console.log({
                                                                suggestion,
                                                            })
                                                            setupMap({
                                                                position:
                                                                    suggestion.center,
                                                                placeName:
                                                                    suggestion.text,
                                                                locationType:
                                                                    'source',
                                                            })
                                                        }}
                                                    >
                                                        {suggestion.place_name}
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Enter Destination"
                                className="input input-sm input-bordered w-full max-w-xs"
                                required
                                {...destination}
                                value={destination.value}
                            />
                            <div>
                                {destination.suggestions?.length > 0 && (
                                    <div
                                        name="suggestion-wrapper"
                                        className="bg-gray-600 text-white absolute right-0 w-11/12 border rounded-md z-50"
                                    >
                                        {destination.suggestions.map(
                                            (suggestion, index) => {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="hover:cursor-pointer max-w-sm border-b-2 border-gray-400 p-2"
                                                        onClick={() => {
                                                            console.log(
                                                                suggestion.center
                                                            )
                                                            destination.setValue(
                                                                suggestion.text
                                                            )
                                                            destination.setPosition(
                                                                suggestion.center
                                                            )
                                                            destination.setSuggestions(
                                                                []
                                                            )
                                                            console.log({
                                                                suggestion,
                                                            })
                                                            setupMap({
                                                                position:
                                                                    suggestion.center,
                                                                placeName:
                                                                    suggestion.text,
                                                                locationType:
                                                                    'destination',
                                                            })
                                                            addMarkerToMap({
                                                                position:
                                                                    source.position,
                                                                placeName:
                                                                    source.value,
                                                                locationType:
                                                                    'source',
                                                            })
                                                        }}
                                                    >
                                                        {suggestion.place_name}
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-wide"
                                onClick={(e) => {
                                    e.preventDefault()
                                    //Fetch the routes and display on the map
                                    if (routePreference == 'all') {
                                        getAllRoutes(source, destination)
                                    } else {
                                        getRoutes(source, destination)
                                    }
                                    setupMap({
                                        position: destination.position,
                                        placeName: destination.value,
                                        locationType: 'destination',
                                    })
                                    addMarkerToMap({
                                        position: source.position,
                                        placeName: source.value,
                                        locationType: 'source',
                                    })
                                    setIsLoading(true)
                                }}
                            >
                                Find
                            </button>
                        </div>
                    </form>
                    <div>
                        {routePreference != 'all' && (
                            <div className="text-center text-xl">
                                <span className="text-blue-500">
                                    {isLoading
                                        ? prettyMetric(0).humanize()
                                        : prettyMetric(distance).humanize()}
                                </span>
                                <span className="text-gray-500">|</span>{' '}
                                <span className="text-green-400">
                                    {isLoading
                                        ? prettyMilliseconds(0)
                                        : prettyMilliseconds(time)}{' '}
                                </span>
                                <span className="text-gray-500">|</span>{' '}
                                <span className="text-red-500">
                                    {isLoading ? 0 : exposure?.toFixed(2)} μg/㎥
                                    h
                                </span>
                            </div>
                        )}
                        {routePreference != 'all' && (
                            <div className="collapse mt-3 bg-base-200 rounded-lg">
                                <input type="checkbox" />
                                <div className="collapse-title text-lg font-semibold text-center text-primary">
                                    📋 Route Instructions
                                </div>
                                <div className="collapse-content bg-base-100 rounded-b-lg">
                                    {instructions.length > 0 && !isLoading ? (
                                        <div className="overflow-auto max-h-80 p-2">
                                            <ol className="space-y-2">
                                                {instructions.map(
                                                    (instruction, index) => {
                                                        return (
                                                            <li key={index} className="bg-base-200 p-3 rounded-lg border-l-4 border-primary">
                                                                <Instruction
                                                                    key={index}
                                                                    index={index}
                                                                    instruction={instruction}
                                                                />
                                                            </li>
                                                        )
                                                    }
                                                )}
                                            </ol>
                                        </div>
                                    ) : isLoading ? (
                                        <div className="flex flex-col items-center p-6">
                                            <div className="loading loading-spinner loading-md mb-3"></div>
                                            <span className="text-sm text-gray-600">
                                                Fetching route instructions...
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center p-6 text-gray-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="w-12 h-12 mb-2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                                                />
                                            </svg>
                                            <span className="text-center">No instructions available yet</span>
                                            <span className="text-xs text-center mt-1">Select a route to see step-by-step directions</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="collapse mt-3 bg-base-200 rounded-lg">
                            <input type="checkbox" />
                            <div className="collapse-title text-lg font-semibold text-center text-primary">
                                📊 Route Details
                            </div>
                            <div className="collapse-content bg-base-100 rounded-b-lg">
                                {routePreference == 'all' ? (
                                    <div className="overflow-auto max-h-96 p-2 space-y-4">
                                        {/* Shortest Route Card */}
                                        <div className="card bg-base-200 shadow-sm">
                                            <div className="card-body p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-4 h-4 bg-shortest rounded-full"></div>
                                                    <h3 className="card-title text-lg">Shortest Route</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Distance:</span>
                                                        <span className="font-medium">{prettyMetric(shortestRoute?.distance).humanize()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Time:</span>
                                                        <span className="font-medium">
                                                            {(shortestRoute?.time || shortestRoute?.duration) && 
                                                                prettyMilliseconds(shortestRoute?.time || shortestRoute?.duration)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Exposure:</span>
                                                        <span className="font-medium">{shortestRoute?.total_exposure?.toFixed(2)} µg/㎥</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Energy:</span>
                                                        <span className="font-medium">{shortestRoute?.total_energy?.toFixed(2)} kJ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fastest Route Card */}
                                        <div className="card bg-base-200 shadow-sm">
                                            <div className="card-body p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-4 h-4 bg-fastest rounded-full"></div>
                                                    <h3 className="card-title text-lg">Fastest Route</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Distance:</span>
                                                        <span className="font-medium">{prettyMetric(fastestRoute?.distance).humanize()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Time:</span>
                                                        <span className="font-medium">
                                                            {(fastestRoute?.duration || fastestRoute?.time) && 
                                                                prettyMilliseconds(fastestRoute?.duration || fastestRoute?.time)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Exposure:</span>
                                                        <span className="font-medium">{fastestRoute?.total_exposure?.toFixed(2)} µg/㎥</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Energy:</span>
                                                        <span className="font-medium">{fastestRoute?.total_energy?.toFixed(2)} kJ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* LEAP Route Card */}
                                        <div className="card bg-base-200 shadow-sm">
                                            <div className="card-body p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-4 h-4 bg-leap rounded-full"></div>
                                                    <h3 className="card-title text-lg">LEAP Route</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Distance:</span>
                                                        <span className="font-medium">{prettyMetric(leapRoute?.distance).humanize()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Time:</span>
                                                        <span className="font-medium">
                                                            {leapRoute?.time && prettyMilliseconds(leapRoute?.time)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Exposure:</span>
                                                        <span className="font-medium">{leapRoute?.total_exposure?.toFixed(2)} µg/㎥</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Energy:</span>
                                                        <span className="font-medium">{leapRoute?.total_energy?.toFixed(2)} kJ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* LCO2 Route Card */}
                                        <div className="card bg-base-200 shadow-sm">
                                            <div className="card-body p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-4 h-4 bg-emission rounded-full"></div>
                                                    <h3 className="card-title text-lg">LCO2 Route</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Distance:</span>
                                                        <span className="font-medium">{prettyMetric(leastCarbonRoute?.distance).humanize()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Time:</span>
                                                        <span className="font-medium">
                                                            {leastCarbonRoute?.time && prettyMilliseconds(leastCarbonRoute?.time)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Exposure:</span>
                                                        <span className="font-medium">{leastCarbonRoute?.total_exposure?.toFixed(2)} µg/㎥</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Energy:</span>
                                                        <span className="font-medium">{leastCarbonRoute?.total_energy?.toFixed(2)} kJ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Suggested Route Card */}
                                        <div className="card bg-base-200 shadow-sm">
                                            <div className="card-body p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-4 h-4 bg-balanced rounded-full"></div>
                                                    <h3 className="card-title text-lg">Suggested Route</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Distance:</span>
                                                        <span className="font-medium">{prettyMetric(balancedRoute?.distance).humanize()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Time:</span>
                                                        <span className="font-medium">
                                                            {(balancedRoute?.time ?? balancedRoute?.duration) && 
                                                                prettyMilliseconds(balancedRoute?.time ?? balancedRoute?.duration)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Exposure:</span>
                                                        <span className="font-medium">{balancedRoute?.total_exposure?.toFixed(2)} µg/㎥</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Energy:</span>
                                                        <span className="font-medium">{balancedRoute?.total_energy?.toFixed(2)} kJ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <div className="card bg-base-200 shadow-sm">
                                            <div className="card-body p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className={`w-4 h-4 rounded-full ${
                                                        routePreference === 'shortest' ? 'bg-shortest' :
                                                        routePreference === 'fastest' ? 'bg-fastest' :
                                                        routePreference === 'leap' ? 'bg-leap' :
                                                        routePreference === 'emission' ? 'bg-emission' :
                                                        routePreference === 'balanced' ? 'bg-balanced' : 'bg-gray-400'
                                                    }`}></div>
                                                    <h3 className="card-title text-lg capitalize">{routePreference} Route</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Vehicle:</span>
                                                        <span className="font-medium capitalize">{mode}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Distance:</span>
                                                        <span className="font-medium">
                                                            {routePreference == 'shortest' ? prettyMetric(shortestRoute?.distance).humanize() :
                                                             routePreference == 'fastest' ? prettyMetric(fastestRoute?.distance).humanize() :
                                                             routePreference == 'leap' ? prettyMetric(leapRoute?.distance).humanize() :
                                                             routePreference == 'emission' ? prettyMetric(leastCarbonRoute?.distance).humanize() :
                                                             routePreference == 'balanced' ? prettyMetric(balancedRoute?.distance).humanize() :
                                                             'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Time:</span>
                                                        <span className="font-medium">
                                                            {routePreference == 'shortest' ? ((shortestRoute?.time || shortestRoute?.duration) && prettyMilliseconds(shortestRoute?.time || shortestRoute?.duration)) :
                                                             routePreference == 'fastest' ? ((fastestRoute?.duration || fastestRoute?.time) && prettyMilliseconds(fastestRoute?.duration || fastestRoute?.time)) :
                                                             routePreference == 'leap' ? (leapRoute?.time && prettyMilliseconds(leapRoute?.time)) :
                                                             routePreference == 'emission' ? (leastCarbonRoute?.time && prettyMilliseconds(leastCarbonRoute?.time)) :
                                                             routePreference == 'balanced' ? ((balancedRoute?.duration ?? balancedRoute?.time) && prettyMilliseconds(balancedRoute?.duration ?? balancedRoute?.time)) :
                                                             'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Exposure:</span>
                                                        <span className="font-medium">
                                                            {routePreference == 'leap' ? `${leapRoute?.total_exposure?.toFixed(2)} µg/㎥` :
                                                             routePreference == 'balanced' ? `${balancedRoute?.total_exposure?.toFixed(2)} µg/㎥` :
                                                             routePreference == 'shortest' ? `${shortestRoute?.total_exposure?.toFixed(2)} µg/㎥` :
                                                             routePreference == 'fastest' ? `${fastestRoute?.total_exposure?.toFixed(2)} µg/㎥` :
                                                             routePreference == 'emission' ? `${leastCarbonRoute?.total_exposure?.toFixed(2)} µg/㎥` :
                                                             'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
