import { useEffect, useRef, useState } from 'react';
import { FiMapPin, FiCrosshair, FiSearch } from 'react-icons/fi';

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [map, setMap] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(initialLocation || {
    lat: -1.286389,  // Nairobi coordinates
    lng: 36.817223
  });
  const [addressDetails, setAddressDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    // Check if script is already loaded
    if (window.google && window.google.maps) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    window.initMap = () => {
      setScriptLoaded(true);
    };
    
    document.head.appendChild(script);

    return () => {
      delete window.initMap;
    };
  }, []);

  // Initialize map when script loads
  useEffect(() => {
    if (scriptLoaded && mapRef.current && !map) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: currentLocation,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Add marker
      const marker = new window.google.maps.Marker({
        position: currentLocation,
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });

      // Update location when marker is dragged
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        const newLocation = {
          lat: position.lat(),
          lng: position.lng()
        };
        setCurrentLocation(newLocation);
        reverseGeocode(newLocation.lat, newLocation.lng);
      });

      // Click on map to move marker
      mapInstance.addListener('click', (e) => {
        const newLocation = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        marker.setPosition(newLocation);
        setCurrentLocation(newLocation);
        reverseGeocode(newLocation.lat, newLocation.lng);
      });

      setMap(mapInstance);
      markerRef.current = marker;

      // If initial location exists, reverse geocode it
      if (initialLocation) {
        reverseGeocode(initialLocation.lat, initialLocation.lng);
      }
    }
  }, [scriptLoaded, mapRef.current]);

  const reverseGeocode = async (lat, lng) => {
    setIsLoading(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const address = response.results[0];
        const components = address.address_components;
        
        // Extract address components
        let street = '', city = '', county = '', postalCode = '', country = '';
        
        components.forEach(component => {
          if (component.types.includes('route')) street = component.long_name;
          if (component.types.includes('locality')) city = component.long_name;
          if (component.types.includes('administrative_area_level_1')) county = component.long_name;
          if (component.types.includes('postal_code')) postalCode = component.long_name;
          if (component.types.includes('country')) country = component.long_name;
        });

        const addressData = {
          full_address: address.formatted_address,
          street: street,
          city: city,
          county: county,
          postal_code: postalCode,
          country: country,
          lat: lat,
          lng: lng,
          place_id: address.place_id
        };
        
        setAddressDetails(addressData);
        if (onLocationSelect) {
          onLocationSelect(addressData);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchPlace = () => {
    if (!window.google || !window.google.maps || !searchInputRef.current) return;
    
    const searchBox = new window.google.maps.places.SearchBox(searchInputRef.current);
    
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;
      
      const place = places[0];
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      
      setCurrentLocation(location);
      if (map) {
        map.setCenter(location);
        map.setZoom(16);
      }
      if (markerRef.current) {
        markerRef.current.setPosition(location);
      }
      reverseGeocode(location.lat, location.lng);
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          if (map) {
            map.setCenter(location);
            map.setZoom(16);
          }
          if (markerRef.current) {
            markerRef.current.setPosition(location);
          }
          reverseGeocode(location.lat, location.lng);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please search manually.');
          setIsLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  if (!scriptLoaded) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for your location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onFocus={searchPlace}
          />
        </div>
        <button
          onClick={getCurrentLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FiCrosshair className="w-5 h-5" />
          <span>Current</span>
        </button>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-300"
      ></div>

      {/* Location Details */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Getting address details...</p>
        </div>
      )}

      {addressDetails.full_address && !isLoading && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-2">
            <FiMapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Selected Location</p>
              <p className="text-gray-600 text-sm">{addressDetails.full_address}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
                {addressDetails.street && <p>Street: {addressDetails.street}</p>}
                {addressDetails.city && <p>City: {addressDetails.city}</p>}
                {addressDetails.county && <p>County: {addressDetails.county}</p>}
                {addressDetails.postal_code && <p>Postal Code: {addressDetails.postal_code}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;