import React, { useEffect, useState } from 'react';
const apikey = 'AIzaSyC53C8Dber8sF4eImYJ3jdQ5Sql-BFKs9g'
const GoogleMapComponent = ({ formik, handleLocation }) => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [addressDetails, setAddressDetails] = useState({});
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(true); // Track loading state
    const [error, setError] = useState(null); // Track error state

    // useEffect(() => {
    //     console.log("Component Mounted: Loading Google Maps API...");
    //     // Load Google Maps API dynamically
    //     if (!window.google) {
    //         const script = document.createElement('script');
    //         script.src = `https://maps.googleapis.com/maps/api/js?key=${apikey}&callback=initMap&libraries=places`;
    //         script.async = true;
    //         script.defer = true;
    //         document.body.appendChild(script);
    //         window.initMap = initMap;
    //     } else {
    //         initMap();
    //     }
    // }, []);
    useEffect(() => {
        console.log("Component Mounted: Loading Google Maps API...");

        const loadGoogleMaps = () => {
            const checkIfGoogleMapsLoaded = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(checkIfGoogleMapsLoaded);
                    console.log("Google Maps script loaded successfully.");
                    initMap();
                }
            }, 100);
        };

        if (!window.google || !window.google.maps) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apikey}&libraries=places`;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);

            script.onload = () => {
                console.log("Google Maps API script tag loaded.");
                loadGoogleMaps();
            };

            script.onerror = () => {
                console.error("Failed to load Google Maps script.");
            };
        } else {
            loadGoogleMaps();
        }
    }, []);


    const initMap = () => {
        console.log("Initializing Map...");

        // Get user's current location
        if (navigator.geolocation) {
            console.log("Asking for user's location...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("POSITION:", position)
                    const { latitude, longitude } = position.coords;
                    console.log("Location retrieved: ", { latitude, longitude });
                    setCurrentLocation({ lat: latitude, lng: longitude });
                    setLoading(false); // Set loading to false when location is fetched

                    // Create a new map centered on the user's location
                    const mapOptions = {
                        center: { lat: latitude, lng: longitude },
                        zoom: 15,
                    };
                    const newMap = new window.google.maps.Map(document.getElementById('map'), mapOptions);
                    setMap(newMap);
                    console.log("Map initialized with user's location.");

                    // Add a marker at the user's location
                    const newMarker = new window.google.maps.Marker({
                        position: { lat: latitude, lng: longitude },
                        map: newMap,
                        draggable: true,
                    });
                    setMarker(newMarker);
                    console.log("Marker placed at user's location.");

                    // Reverse Geocode to get detailed address
                    getAddressDetails(latitude, longitude);

                    // Add event listener for dragging the marker to get new coordinates
                    newMarker.addListener('dragend', (e) => {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        console.log(`Marker dragged to: Latitude: ${lat}, Longitude: ${lng}`);
                        setSelectedLocation({ lat, lng });
                        getAddressDetails(lat, lng);
                    });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setError("Unable to retrieve location. Please check your permissions.");
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true, // <-- add this
                    timeout: 100000,
                    maximumAge: 0,
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    const getAddressDetails = (lat, lng) => {
        console.log(`Fetching address details for coordinates: ${lat}, ${lng}`);
        const geocoder = new window.google.maps.Geocoder();
        const latLng = new window.google.maps.LatLng(lat, lng);

        geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results[0]) {
                console.log("Address details retrieved:", results);

                const address = results[0].formatted_address;
                const components = results[0].address_components;

                const getComponent = (types) => {
                    const comp = components.find(c => types.every(type => c.types.includes(type)));
                    return comp ? comp.long_name : '';
                };

                const city = getComponent(['locality']) || getComponent(['administrative_area_level_2']);
                const locality = getComponent(['sublocality']) || getComponent(['sublocality_level_1']);
                const landmark = getComponent(['point_of_interest']) || getComponent(['premise']) || getComponent(['establishment']);
                const state = getComponent(['administrative_area_level_1']);
                const country = getComponent(['country']);
                const postalCode = getComponent(['postal_code']);
                const street = getComponent(['route']) || getComponent(['street_address']);

                setAddressDetails({
                    address,
                    city,
                    locality,
                    landmark,
                    state,
                    country,
                    postalCode,
                    street,
                });



                console.log("Address details updated:", {
                    address,
                    city,
                    locality,
                    landmark,
                    state,
                    country,
                    postalCode,
                    street,
                });
                handleLocation({
                    address,
                    city,
                    locality,
                    landmark,
                    state,
                    country,
                    postalCode,
                    street,
                });
                // Update Formik values
                // formik.setFieldValue('hotelAddress', address);
                // formik.setFieldValue('city', city);
                // formik.setFieldValue('locality', locality);
                // formik.setFieldValue('landmark', landmark);
                // formik.setFieldValue('pincode', postalCode);
                // console.log(formik);

            } else {
                console.error('Geocoder failed due to: ' + status);
            }
        });
    };

    return (
        <div>
            {/* Loading Spinner */}
            {loading && <p>Loading map...</p>}

            {/* Error Message */}
            {error && <p>{error}</p>}

            {/* Display the map */}
            <div id="map" style={{ width: '100%', height: '400px' }}></div>

            {/* Show address details */}
            {/* {addressDetails && (
                <div>
                    <h3>Address Details</h3>
                    <p>Address: {addressDetails.address}</p>
                    <p>City: {addressDetails.city}</p>
                    <p>Country: {addressDetails.country}</p>
                    <p>Postal Code: {addressDetails.postalCode}</p>
                    <p>Street: {addressDetails.street}</p>
                </div>
            )} */}
        </div>
    );
};

export default GoogleMapComponent;
