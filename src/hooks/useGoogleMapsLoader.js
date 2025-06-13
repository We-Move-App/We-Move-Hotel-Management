import { useEffect, useState } from "react";

export const useGoogleMapsLoader = (apiKey) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps API is already available
    const checkIfReady = () => {
      if (window.google && window.google.maps) {
        setLoaded(true);
        return true;
      }
      return false;
    };

    // If already loaded, skip script injection
    if (checkIfReady()) return;

    // Check if the script is already in the DOM
    const existingScript = document.querySelector("#google-maps-script");
    if (existingScript) {
      // If script exists, just set the onload handler
      existingScript.onload = checkIfReady;
      return;
    }

    // Otherwise, create and append the script to load Google Maps
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = checkIfReady;
    document.body.appendChild(script);

    // Cleanup function to remove the script if the component unmounts
    return () => {
      script.remove();
    };
  }, [apiKey]);

  return loaded;
};
