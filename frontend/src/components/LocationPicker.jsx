import { useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin } from 'lucide-react';

let googleMapsPromise;

function loadGoogleMaps(apiKey) {
  if (window.google?.maps?.places) return Promise.resolve(window.google.maps);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Google Maps could not be loaded.'));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export default function LocationPicker({ value, onChange }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const mapsRef = useRef(null);
  const geocoderRef = useRef(null);
  const setLocationRef = useRef(null);
  const [mapStatus, setMapStatus] = useState(apiKey ? 'loading' : 'unconfigured');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (!apiKey || !mapRef.current || mapInstanceRef.current) return undefined;

    let clickListener;
    let placeListener;
    let isMounted = true;

    const setLocation = (maps, location, address) => {
      if (!markerRef.current) {
        markerRef.current = new maps.Marker({ map: mapInstanceRef.current, position: location });
      } else {
        markerRef.current.setPosition(location);
      }
      mapInstanceRef.current.panTo(location);
      if (address) onChange(address);
    };

    const initializeMap = async () => {
      try {
        const maps = await loadGoogleMaps(apiKey);
        if (!isMounted || !mapRef.current) return;

        const kathmandu = { lat: 27.7172, lng: 85.324 };
        const map = new maps.Map(mapRef.current, {
          center: kathmandu,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapInstanceRef.current = map;
        const geocoder = new maps.Geocoder();
        mapsRef.current = maps;
        geocoderRef.current = geocoder;
        setLocationRef.current = setLocation;

        clickListener = map.addListener('click', ({ latLng }) => {
          setLocation(maps, latLng);
          geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results?.[0]) onChange(results[0].formatted_address);
          });
        });

        const autocomplete = new maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry', 'name'],
          componentRestrictions: { country: 'np' },
        });
        placeListener = autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location) return;
          setLocation(maps, place.geometry.location, place.formatted_address || place.name);
          map.setZoom(16);
        });

        setMapStatus('ready');
      } catch (error) {
        console.error(error);
        if (isMounted) setMapStatus('error');
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      clickListener?.remove();
      placeListener?.remove();
      setLocationRef.current = null;
    };
  }, [apiKey, onChange]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation || !mapsRef.current || !geocoderRef.current || !setLocationRef.current) {
      setLocationError('Current location is not available. Search for your address instead.');
      return;
    }

    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { lat: coords.latitude, lng: coords.longitude };
        setLocationRef.current(mapsRef.current, location);
        mapInstanceRef.current.setZoom(16);
        geocoderRef.current.geocode({ location }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            onChange(results[0].formatted_address);
          } else {
            setLocationError('Location found, but its address could not be determined.');
          }
        });
      },
      () => setLocationError('We could not access your location. Please allow location access and try again.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#7d665f]">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          required
          placeholder="Search or select your service location"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-[18px] border border-[#e7d8c8] bg-[#fffdfb] py-3 pl-10 pr-4 text-sm text-[#2b241f] outline-none transition-colors focus:border-[#d38b66]"
        />
      </div>

      {mapStatus === 'unconfigured' ? (
        <p className="rounded-[14px] bg-[#faf5f0] px-3 py-2 text-xs text-[#655d5a]">
          Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to enable location selection on Google Maps.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-[#e7d8c8] bg-[#faf5f0]">
          <div ref={mapRef} className="h-64 w-full" />
          {mapStatus === 'loading' && (
            <p className="border-t border-[#e7d8c8] px-3 py-2 text-xs text-[#655d5a]">Loading map…</p>
          )}
          {mapStatus === 'error' && (
            <p className="border-t border-[#e7d8c8] px-3 py-2 text-xs text-[#a54a35]">
              Map unavailable. You can still enter the address manually.
            </p>
          )}
        </div>
      )}
      {mapStatus === 'ready' && (
        <>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="inline-flex items-center gap-2 rounded-full border border-[#d7b091] bg-[#fffdfb] px-3 py-2 text-xs font-semibold text-[#8a4d2b] transition-colors hover:bg-[#f9efe7]"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            Use current location
          </button>
          <p className="text-xs text-[#655d5a]">Search for an address or click the map to set the service location.</p>
        </>
      )}
      {locationError && <p className="text-xs text-[#a54a35]">{locationError}</p>}
    </div>
  );
}
