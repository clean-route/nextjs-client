

export default function getGeojson(route) {
    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: '',
        },
    }

    if (route.duration) {  // test for mapbox route
        geojson.geometry.coordinates = route.geometry.coordinates
    } else {
        geojson.geometry.coordinates = route.points.coordinates
    }
    
    return geojson
}
