import { Autocomplete, GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useCallback, useEffect, useRef, useState } from "react";
import CustomInput from "../custom/Form-Fields/CInput/CustomInput";

const center = {
    lat: 28.6139, // New Delhi
    lng: 77.2090,
};

const GooglePlacesAutocomplete = ({ formik }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
        libraries: ["places"],
    });

    const initialLatLng = formik.values.latitude && formik.values.longitude
        ? { lat: Number(formik.values.latitude), lng: Number(formik.values.longitude) }
        : center;

    const [selected, setSelected] = useState(initialLatLng);
    const [address, setAddress] = useState(formik.values?.hotelAddress || "");

    const autocompleteRef = useRef(null);
    const geocoderRef = useRef(null);

    useEffect(() => {
        if (window.google && !geocoderRef.current) {
            geocoderRef.current = new window.google.maps.Geocoder();
        }
    }, [isLoaded]);

    const parseAddressComponents = (result, lat, lng) => {
        const components = result.address_components || [];

        const getComponent = (types) =>
            components.find((c) => types.some((t) => c.types.includes(t)))?.long_name || "";

        const city = getComponent(["locality", "administrative_area_level_2"]);
        const locality = getComponent(["sublocality_level_1", "sublocality"]);
        const pincode = getComponent(["postal_code"]);
        const landmark = getComponent(["point_of_interest", "premise", "establishment"]);
        const state = getComponent(["administrative_area_level_1"]);
        const country = getComponent(["country"]);
        const formatted_address = result.formatted_address || "";

        formik.setFieldValue('hotelAddress', formatted_address);
        formik.setFieldValue('city', city);
        formik.setFieldValue('locality', locality);
        formik.setFieldValue('landmark', landmark);
        formik.setFieldValue('pincode', pincode);
        formik.setFieldValue('state', state || "Delhi");
        formik.setFieldValue('country', country || "India");
        formik.setFieldValue('latitude', lat);
        formik.setFieldValue('longitude', lng);

        setAddress(formatted_address);
    };

    const getPlaceDetails = (lat, lng) => {
        if (geocoderRef.current) {
            geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results[0]) {
                    parseAddressComponents(results[0], lat, lng);
                }
            });
        }
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry) {
                const location = place.geometry.location;
                const newLatLng = { lat: location.lat(), lng: location.lng() };
                setSelected(newLatLng);
                parseAddressComponents(place, newLatLng.lat, newLatLng.lng);
            }
        }
    };

    const onMapClick = useCallback((event) => {
        const newLatLng = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        };
        setSelected(newLatLng);
        getPlaceDetails(newLatLng.lat, newLatLng.lng);
    }, []);

    useEffect(() => {
        setAddress(formik.values.hotelAddress);
    }, [])

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <div>
            <GoogleMap
                mapContainerStyle={{ width: "100%", height: "200px" }}
                zoom={14}
                center={selected}
                onClick={onMapClick}
            >
                <Marker
                    position={selected}
                    draggable={true}
                    onDragEnd={onMapClick}
                />
            </GoogleMap>
            <br />
            <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={onPlaceChanged}
            >
                <CustomInput
                    value={address}
                    placeholder="Search a place"
                    label={'Address'}
                    required={true}
                    onChange={() => { }} // Autocomplete handles typing
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();  // 🚫 Prevent form submit
                        }
                    }}
                />
            </Autocomplete>
        </div>
    );
};

export default GooglePlacesAutocomplete;
