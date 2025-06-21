// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_SERVER_URL,
    MAPBOX_ACCESS_TOKEN: process.env.REACT_APP_MAPBOX_API_KEY,
    GRAPHHOPPER_API_KEY: process.env.REACT_APP_GRAPHHOPPER_API_KEY,
}

// Map Configuration
export const MAP_CONFIG = {
    DEFAULT_POSITION: [0, 0],
    DEFAULT_ZOOM: 9,
    INDIA_BOUNDS: [
        [67.77384991, 10.27430903], // southwest coordinates for india
        [98.44100523, 36.45878352], // northeast coordinates for india
    ],
    MAP_STYLE: 'mapbox://styles/saditya9211/clky9t1r1006m01qsaki0c8nz',
}

// Vehicle Configuration
export const VEHICLE_CONFIG = {
    CAR: {
        MIN_MASS: 800,
        MAX_MASS: 3000,
        DEFAULT_MASS: 2500,
        MODE_VALUE: 'driving-traffic',
    },
    TWO_WHEELER: {
        MIN_MASS: 100,
        MAX_MASS: 300,
        DEFAULT_MASS: 150,
        MODE_VALUE: 'scooter',
    },
}

// Route Types
export const ROUTE_TYPES = {
    SHORTEST: 'shortest',
    FASTEST: 'fastest',
    LEAP: 'leap',
    EMISSION: 'emission',
    BALANCED: 'balanced',
    ALL: 'all',
}

// Route Colors (CSS classes)
export const ROUTE_COLORS = {
    [ROUTE_TYPES.SHORTEST]: 'bg-shortest',
    [ROUTE_TYPES.FASTEST]: 'bg-fastest',
    [ROUTE_TYPES.LEAP]: 'bg-leap',
    [ROUTE_TYPES.EMISSION]: 'bg-emission',
    [ROUTE_TYPES.BALANCED]: 'bg-balanced',
}

// Route Labels
export const ROUTE_LABELS = {
    [ROUTE_TYPES.SHORTEST]: 'Shortest Route',
    [ROUTE_TYPES.FASTEST]: 'Fastest Route',
    [ROUTE_TYPES.LEAP]: 'LEAP Route',
    [ROUTE_TYPES.EMISSION]: 'LCO2 Route',
    [ROUTE_TYPES.BALANCED]: 'Suggested Route',
}

// Vehicle Conditions
export const VEHICLE_CONDITIONS = [
    { value: 'okay', label: 'Okay (10+ years)' },
    { value: 'average', label: 'Average (5+ years)' },
    { value: 'good', label: 'Good (2 years)' },
    { value: 'new', label: 'New (recently bought)' },
]

// Engine Types
export const ENGINE_TYPES = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'cng', label: 'CNG' },
    { value: 'ev', label: 'EV' },
]

// Departure Times
export const DEPARTURE_TIMES = [
    { value: '0', label: 'Now' },
    { value: '1', label: '+ 1 hrs' },
    { value: '2', label: '+ 2 hrs' },
    { value: '3', label: '+ 3 hrs' },
    { value: '4', label: '+ 4 hrs' },
    { value: '5', label: '+ 5 hrs' },
    { value: '6', label: '+ 6 hrs' },
]

// Route Preferences
export const ROUTE_PREFERENCES = [
    { value: ROUTE_TYPES.SHORTEST, label: 'Shortest (Distance)' },
    { value: ROUTE_TYPES.FASTEST, label: 'Fastest (Time)' },
    { value: ROUTE_TYPES.LEAP, label: 'LEAP (exposure)' },
    { value: ROUTE_TYPES.EMISSION, label: 'LCO2 (emission)' },
    { value: ROUTE_TYPES.BALANCED, label: 'Suggested (recommended)' },
    { value: ROUTE_TYPES.ALL, label: 'All' },
]

// Form Validation
export const FORM_VALIDATION = {
    REQUIRED_FIELDS: ['mode', 'vehicleMass', 'vehicleCondition', 'engineType', 'routePreference', 'delayCode'],
    VEHICLE_MASS_RANGES: {
        car: { min: 800, max: 3000 },
        'two-wheeler': { min: 100, max: 300 },
    },
}

// UI Configuration
export const UI_CONFIG = {
    DRAWER_WIDTH: {
        MOBILE: 'w-10/12',
        TABLET: 'md:w-1/3',
        DESKTOP: 'lg:w-1/4',
    },
    MAP_CONTAINER_ID: 'map-container',
    MAX_INSTRUCTIONS_HEIGHT: 'max-h-80',
    MAX_ROUTE_DETAILS_HEIGHT: 'max-h-96',
} 