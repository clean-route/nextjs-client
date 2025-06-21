import { useState, useEffect } from 'react'
import useInput from './useInput.js'

export const RouteForm = ({ onFindRoutes, setupMap, addMarkerToMap, formData, onFormDataChange }) => {
    // Form state
    const source = useInput('')
    const destination = useInput('')
    const [showColorInfo, setShowColorInfo] = useState(false)

    // Reset vehicle mass when mode changes
    useEffect(() => {
        onFormDataChange({ vehicleMass: '' })
    }, [formData.mode])

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (formData.routePreference === 'all') {
            onFindRoutes(source, destination, 'all')
        } else {
            onFindRoutes(source, destination, 'single')
        }
        
        // Setup map and markers
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
    }

    // Handle suggestion click
    const handleSuggestionClick = (suggestion, inputType) => {
        const input = inputType === 'source' ? source : destination
        
        input.setValue(suggestion.text)
        input.setPosition(suggestion.center)
        input.setSuggestions([])
        
        setupMap({
            position: suggestion.center,
            placeName: suggestion.text,
            locationType: inputType,
        })
        
        // Add source marker when destination is selected
        if (inputType === 'destination') {
            addMarkerToMap({
                position: source.position,
                placeName: source.value,
                locationType: 'source',
            })
        }
    }

    // Handle form field changes
    const handleFieldChange = (field, value) => {
        onFormDataChange({ [field]: value })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-3 items-center">
                {/* 1. Mode of Transport */}
                <select
                    className="select select-sm select-bordered w-full max-w-xs text-center"
                    required
                    value={formData.mode}
                    onChange={(e) => handleFieldChange('mode', e.target.value)}
                >
                    <option disabled value="" className="text-center">
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
                        value={formData.vehicleMass}
                        onChange={(e) => handleFieldChange('vehicleMass', e.target.value)}
                        min={formData.mode === 'car' ? 800 : 100}
                        max={formData.mode === 'car' ? 3000 : 300}
                        required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        {formData.mode === 'car' ? 'Range: 800-3000 kg' : formData.mode === 'two-wheeler' ? 'Range: 100-300 kg' : 'Select mode first'}
                    </div>
                </div>

                {/* 3. Vehicle Condition */}
                <select
                    className="select select-sm select-bordered w-full max-w-xs"
                    required
                    value={formData.vehicleCondition}
                    onChange={(e) => handleFieldChange('vehicleCondition', e.target.value)}
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
                    value={formData.engineType}
                    onChange={(e) => handleFieldChange('engineType', e.target.value)}
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
                            value={formData.routePreference}
                            onChange={(e) => handleFieldChange('routePreference', e.target.value)}
                        >
                            <option disabled value="">
                                -- Select Route Preference --
                            </option>
                            <option value="shortest">Shortest (Distance)</option>
                            <option value="fastest">Fastest (Time)</option>
                            <option value="leap">LEAP (exposure)</option>
                            <option value="emission">LCO2 (emission)</option>
                            <option value="balanced">Suggested (recommended)</option>
                            <option value="all">All</option>
                        </select>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer"
                            onClick={() => setShowColorInfo(!showColorInfo)}
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
                    value={formData.delayCode}
                    onChange={(e) => handleFieldChange('delayCode', e.target.value)}
                >
                    <option disabled value="none" className="text-center">
                        -- Depart at --
                    </option>
                    <option value="0">Now</option>
                    <option value="1">+ 1 hrs</option>
                    <option value="2">+ 2 hrs</option>
                    <option value="3">+ 3 hrs</option>
                    <option value="4">+ 4 hrs</option>
                    <option value="5">+ 5 hrs</option>
                    <option value="6">+ 6 hrs</option>
                </select>

                {/* Source Input */}
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
                        <div className="bg-gray-600 text-white absolute right-0 w-11/12 border rounded-md z-50">
                            {source.suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="hover:cursor-pointer max-w-sm border-b-2 border-gray-400 p-2"
                                    onClick={() => handleSuggestionClick(suggestion, 'source')}
                                >
                                    {suggestion.place_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Destination Input */}
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
                        <div className="bg-gray-600 text-white absolute right-0 w-11/12 border rounded-md z-50">
                            {destination.suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="hover:cursor-pointer max-w-sm border-b-2 border-gray-400 p-2"
                                    onClick={() => handleSuggestionClick(suggestion, 'destination')}
                                >
                                    {suggestion.place_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-wide">
                    Find
                </button>
            </div>
        </form>
    )
} 