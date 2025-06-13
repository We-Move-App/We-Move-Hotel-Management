import React, { useEffect, useRef, useState } from "react";
import { useGoogleMapsLoader } from "../../../hooks/useGoogleMapsLoader";

const GoogleMapLocationPicker = ({ apiKey = "AIzaSyC53C8Dber8sF4eImYJ3jdQ5Sql-BFKs9g" }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const [locationData, setLocationData] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({ lat: 12.9716, lng: 77.5946 }); // Default: Bengaluru
  const loaded = useGoogleMapsLoader(apiKey);

  // Update map when loader and DOM ready
  useEffect(() => {
    // Request current location
    requestCurrentLocation();
    if (!loaded || !mapRef.current || !window.google?.maps?.Map) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: currentCoords,
      zoom: 15,
    });

    // Create the AdvancedMarkerElement instead of google.maps.Marker
    const marker = new window.google.maps.Marker({
      position: currentCoords,
      map,
      draggable: true,
    });

    mapInstance.current = map;
    markerRef.current = marker;

    fetchLocationDetails(currentCoords.lat, currentCoords.lng);

    window.google.maps.event.addListener(map, "click", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      updateMarkerPosition(lat, lng);
    });

    marker.addListener("dragend", () => {
      const newPos = marker.getPosition();
      if (newPos) updateMarkerPosition(newPos.lat(), newPos.lng());
    });

    // // Request current location
    // requestCurrentLocation();
  }, [loaded]);

  const requestCurrentLocation = () => {
    // Check if geolocation API is available
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser.");
      return;
    }

    // Ask for location permission if it's not already granted
    navigator?.geolocation?.getCurrentPosition(
      ({ coords }) => {
        const userCoords = { lat: coords.latitude, lng: coords.longitude };
        setHasPermission(true);
        console.log("Permission given", coords)
        setCurrentCoords(userCoords);
        console.log("CORDS:", currentCoords)

        updateMarkerPosition(userCoords.lat, userCoords.lng);
        mapInstance.current?.setCenter(userCoords);
      },
      (error) => {
        setHasPermission(false);
        console.warn("Permission denied or error getting location:", error.message);
        // Fallback to Bengaluru coordinates if there's an error or permission is denied
        setCurrentCoords({ lat: 12.9716, lng: 77.5946 }); // Default: Bengaluru
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // Set timeout for location fetch
        maximumAge: 0,
      }
    );
  };

  const updateMarkerPosition = (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
      mapInstance.current?.setCenter({ lat, lng });
      fetchLocationDetails(lat, lng);
    }
  };

  const fetchLocationDetails = (lat, lng) => {
    console.log("from fetchLocationDetails", lat, lng);
    
    const geocoder = new window.google.maps.Geocoder();
    const request = { location: { lat, lng } };
  
    try {
      const response = geocoder.geocode(request);
      console.log("Geocode Response:", response);
      if (response.status === "OK" && response.results[0]) {
        const components = response.results[0].address_components;
        const get = (type) =>
          components.find((c) => c.types.includes(type))?.long_name || "";
  
        const addressInfo = {
          address: response.results[0].formatted_address,
          pincode: get("postal_code"),
          locality: get("sublocality") || get("neighborhood"),
          city: get("locality") || get("administrative_area_level_2"),
          state: get("administrative_area_level_1"),
          country: get("country"),
          landmark: get("point_of_interest") || get("premise") || get("natural_feature"),
        };
  
        console.log("addressInfo:", addressInfo);
        setLocationData(addressInfo);
      }
    } catch (error) {
      console.error("Geocode failed:", error);
    }
  };
  

//   const fetchLocationDetails = (lat, lng) => {
//     console.log("from fetchLocationDetails",lat, lng)
//     const geocoder = new window.google.maps.Geocoder();
//     geocoder.geocode({ location: { lat, lng } }, (results, status) => {
//         console.log("from fetchlocation:",results, status)
//       if (status === "OK" && results[0]) {
//         const components = results[0].address_components;
//         const get = (type) =>
//           components.find((c) => c.types.includes(type))?.long_name || "";

//         const addressInfo = {
//           address: results[0].formatted_address,
//           pincode: get("postal_code"),
//           locality: get("sublocality") || get("neighborhood"),
//           city: get("locality") || get("administrative_area_level_2"),
//           state: get("administrative_area_level_1"),
//           country: get("country"),
//           landmark: get("point_of_interest") || get("premise") || get("natural_feature"),
//         };
//         console.log("addressInfor:",addressInfo)

//         setLocationData(addressInfo);
//       }else{
//         console.log("status is not OK")
//       }
//     });
//     // console.log("LOCATION DATA",locationData)
//   };

  return (
    <div>
      <div
        id="map"
        ref={mapRef}
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "8px",
          marginBottom: "1rem",
        }}
      ></div>

      {locationData ? (
        <div>
          <h3>📍 Location Info:</h3>
          <pre>{JSON.stringify(locationData, null, 2)}</pre>
        </div>
      ) : (
        <div style={{ color: "red" }}>
         {currentCoords.toString() } ⚠️ Please allow location access to fetch your current location. Using default Bengaluru coordinates for now.
        </div>
      )}
    </div>
  );
};

export default GoogleMapLocationPicker;
