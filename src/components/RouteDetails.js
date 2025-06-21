import { useRef } from 'react'
import prettyMilliseconds from 'pretty-ms'
import prettyMetric from 'pretty-metric'
import Instruction from './Instruction.js'

export const RouteDetails = ({ 
    routePreference, 
    isLoading, 
    distance, 
    time, 
    exposure, 
    instructions,
    shortestRoute,
    fastestRoute,
    leapRoute,
    balancedRoute,
    leastCarbonRoute,
    mode
}) => {
    // Route summary display
    const RouteSummary = () => (
        <div className="text-center text-xl">
            <span className="text-blue-500">
                {isLoading ? prettyMetric(0).humanize() : prettyMetric(distance).humanize()}
            </span>
            <span className="text-gray-500">|</span>{' '}
            <span className="text-green-400">
                {isLoading ? prettyMilliseconds(0) : prettyMilliseconds(time)}{' '}
            </span>
            <span className="text-gray-500">|</span>{' '}
            <span className="text-red-500">
                {isLoading ? 0 : exposure?.toFixed(2)} μg/㎥ h
            </span>
        </div>
    )

    // Instructions display
    const InstructionsDisplay = () => (
        <div className="collapse mt-3 bg-base-200 rounded-lg">
            <input type="checkbox" />
            <div className="collapse-title text-lg font-semibold text-center text-primary">
                📋 Route Instructions
            </div>
            <div className="collapse-content bg-base-100 rounded-b-lg">
                {instructions.length > 0 && !isLoading ? (
                    <div className="overflow-auto max-h-80 p-2">
                        <ol className="space-y-2">
                            {instructions.map((instruction, index) => (
                                <li key={index} className="bg-base-200 p-3 rounded-lg border-l-4 border-primary">
                                    <Instruction index={index} instruction={instruction} />
                                </li>
                            ))}
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
    )

    // Single route details
    const SingleRouteDetails = () => (
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
    )

    // All routes details
    const AllRoutesDetails = () => (
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
    )

    return (
        <>
            {/* Route Summary */}
            {routePreference !== 'all' && <RouteSummary />}
            
            {/* Instructions */}
            {routePreference !== 'all' && <InstructionsDisplay />}
            
            {/* Route Details */}
            <div className="collapse mt-3 bg-base-200 rounded-lg">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold text-center text-primary">
                    📊 Route Details
                </div>
                <div className="collapse-content bg-base-100 rounded-b-lg">
                    {routePreference === 'all' ? <AllRoutesDetails /> : <SingleRouteDetails />}
                </div>
            </div>
        </>
    )
} 