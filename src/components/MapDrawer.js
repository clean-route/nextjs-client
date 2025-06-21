import { useState } from 'react'
import { useMap } from '../hooks/useMap.js'
import { useRouteData } from '../hooks/useRouteData.js'
import { RouteForm } from './RouteForm.js'
import { RouteDetails } from './RouteDetails.js'

export default function MapDrawer() {
    // Drawer state
    const [isExpanded, setIsExpanded] = useState(false)

    // Custom hooks
    const { setupMap, addMarkerToMap, displayRoute } = useMap()
    const {
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
        getRoutes
    } = useRouteData()

    // Form state (will be passed to RouteForm)
    const [formData, setFormData] = useState({
        mode: '',
        vehicleMass: '',
        vehicleCondition: '',
        engineType: '',
        routePreference: '',
        delayCode: null
    })

    // Handle route finding
    const handleFindRoutes = async (source, destination, routeType) => {
        const { mode, vehicleMass, vehicleCondition, engineType, routePreference, delayCode } = formData
        
        await getRoutes(
            source, 
            destination, 
            delayCode, 
            mode, 
            routePreference, 
            vehicleMass, 
            vehicleCondition, 
            engineType, 
            displayRoute
        )
    }

    // Handle form data updates
    const handleFormDataChange = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }))
    }

    return (
        <div className="drawer">
            <input
                id="my-drawer"
                type="checkbox"
                className="drawer-toggle"
                onClick={() => setIsExpanded(!isExpanded)}
            />

            <div className="drawer-content">
                {/* Drawer Toggle Button */}
                <label
                    htmlFor="my-drawer"
                    className="btn drawer-button btn-secondary btn-sm right-12 top-2 absolute z-40"
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

                {/* Map Container */}
                <div>
                    <div className="w-screen absolute -z-30 mr-5">
                        <div id="map-container" className="h-screen w-full"></div>
                    </div>
                </div>
            </div>

            {/* Drawer Side */}
            <div className="drawer-side">
                <label htmlFor="my-drawer" className="drawer-overlay"></label>
                <div className="menu p-4 bg-base-100 w-10/12 md:w-1/3 lg:w-1/4">
                    {/* Header */}
                    <h1 className="text-lg font-semibold title-font text-center border-b-2 pb-2 mx-auto mb-4">
                        Air Pollution Routing - IIT KGP
                    </h1>

                    {/* Route Form */}
                    <RouteForm 
                        onFindRoutes={handleFindRoutes}
                        setupMap={setupMap}
                        addMarkerToMap={addMarkerToMap}
                        formData={formData}
                        onFormDataChange={handleFormDataChange}
                    />

                    {/* Route Details */}
                    <RouteDetails 
                        routePreference={formData.routePreference}
                        isLoading={isLoading}
                        distance={distance}
                        time={time}
                        exposure={exposure}
                        instructions={instructions}
                        shortestRoute={shortestRoute}
                        fastestRoute={fastestRoute}
                        leapRoute={leapRoute}
                        balancedRoute={balancedRoute}
                        leastCarbonRoute={leastCarbonRoute}
                        mode={formData.mode}
                    />
                </div>
            </div>
        </div>
    )
}
