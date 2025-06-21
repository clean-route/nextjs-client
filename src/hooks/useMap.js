import { useEffect } from 'react'
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'
import getIconFromMode from '../utils/getIconFromMode.js'

export const useMap = () => {
    // Initialize map
    const setupMap = ({ position, placeName, locationType = 'default' }) => {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY
        
        window.$map = new mapboxgl.Map({
            container: 'map-container',
            style: 'mapbox://styles/saditya9211/clky9t1r1006m01qsaki0c8nz',
            center: position,
            zoom: 9,
            doubleClickZoom: true,
        }).fitBounds(
            [
                [67.77384991, 10.27430903], // southwest coordinates for india
                [98.44100523, 36.45878352], // northeast coordinates for india
            ],
            {
                padding: 10,
            }
        )

        // Add marker if location is source or destination
        if (locationType === 'source' || locationType === 'destination') {
            addMarkerToMap({ position, placeName, locationType })
        }

        // Add navigation control
        window.$map.addControl(
            new mapboxgl.NavigationControl({
                visualizePitch: true,
            }),
            'bottom-right'
        )

        // Add geolocation control
        window.$map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
            })
        )

        // Add scale control
        const scale = new mapboxgl.ScaleControl({
            maxWidth: 80,
            unit: 'metric',
        })
        window.$map.addControl(scale, 'bottom-left')
    }

    // Add marker to map
    const addMarkerToMap = ({ position, placeName, locationType = 'default', mode, routePreference }) => {
        // Remove existing marker if it exists
        if (window.$map.getLayer(`${position[0]}-${position[1]}-${locationType}-marker`)) {
            console.log('Removing the layer as it exists..')
        }

        window.$map.on('style.load', function () {
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

        // Add popup
        new mapboxgl.Popup()
            .setLngLat(position)
            .setHTML(`<h3 color: "black"><strong>${placeName}</strong></h3>`)
            .addTo(window.$map)

        // Add click handler for popup
        window.$map.on(
            'click',
            `${position[0]}-${position[1]}-${locationType}-marker`,
            function (e) {
                const coordinates = e.features[0].geometry.coordinates.slice()
                const title = e.features[0].properties.title
                
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

    // Display route on map
    const displayRoute = (geojson, start, end, routeId, tempRoutePreference) => {
        const getRouteColor = require('../utils/getRouteColor.js').default
        
        window.$map.addLayer({
            id: routeId,
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

    // Initialize map on mount
    useEffect(() => {
        if (process.env.MAPBOX_API_KEY === 'undefined') {
            console.error('Mapbox API Key is not set. Please set it in .env file.')
            return
        }
        setupMap({ position: [0, 0], placeName: 'Default Location' })
    }, [])

    return {
        setupMap,
        addMarkerToMap,
        displayRoute,
    }
} 