import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Calendar, User, Phone, Car, Clock, ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import './BookRide.css';

export default function BookRide({ user, setCurrentPage }) {
  const [pickupAddress, setPickupAddress] = useState('Sky In Co Living, P.G & Guest rooms, Kukatpally, Hyderabad');
  const [dropAddress, setDropAddress] = useState('');
  
  // Coordinates states
  const [pickupCoords, setPickupCoords] = useState({ lat: 17.49664, lng: 78.40140 });
  const [dropCoords, setDropCoords] = useState(null);
  
  // App UI states
  const [isLocating, setIsLocating] = useState(false);
  const [selectionMode, setSelectionMode] = useState(null); // 'pickup' | 'drop' | null
  const [mapReady, setMapReady] = useState(false);

  // Map refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const selectionModeRef = useRef(selectionMode);

  // Sync ref to prevent stale closures in map click callbacks
  useEffect(() => {
    selectionModeRef.current = selectionMode;
  }, [selectionMode]);

  // Check and wait for Leaflet script from CDN to load
  useEffect(() => {
    const checkLeaflet = setInterval(() => {
      if (window.L) {
        setMapReady(true);
        clearInterval(checkLeaflet);
      }
    }, 100);
    return () => clearInterval(checkLeaflet);
  }, []);

  // Initialize the Map once Leaflet is ready
  useEffect(() => {
    if (!mapReady || !window.L || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to user's location (Hyderabad Kukatpally center)
      const defaultCenter = [17.49664, 78.40140]; 
      
      const map = window.L.map(mapRef.current, {
        center: defaultCenter,
        zoom: 15, // Increase zoom level slightly for better close-up detail
        zoomControl: false
      });

      // Add CartoDB Positron elegant gray map tiles
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      // Add zoom control at bottom right instead of top left
      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;

      // Handle map click for manual coordinate selection
      map.on('click', (e) => {
        const currentMode = selectionModeRef.current;
        if (!currentMode) return;

        const { lat, lng } = e.latlng;
        handleManualLocationSelected(lat, lng, currentMode);
      });
      
      // Auto locate on first mount
      tryAutoLocateOnStart(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapReady]);

  // Sync Markers and Polylines on Coordinate Updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    const escapeHtml = (unsafe) => {
      if (!unsafe) return '';
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // Clear existing markers & route
    if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }
    if (dropMarkerRef.current) {
      map.removeLayer(dropMarkerRef.current);
      dropMarkerRef.current = null;
    }
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const bounds = [];
    const userProfilePic = user?.profile_pic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

    // Setup Pickup Marker
    if (pickupCoords) {
      const pickupIcon = window.L.divIcon({
        html: `
          <div class="custom-marker pickup-marker-pin user-profile-marker">
            <div class="pin-pulse"></div>
            <div class="profile-pic-container">
              <img src="${userProfilePic}" class="profile-pic-marker-img" alt="Current Location" onerror="this.src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'" />
            </div>
            <div class="profile-marker-arrow"></div>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -44]
      });

      const marker = window.L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup(`<b>Pickup Location</b><br/>${escapeHtml(pickupAddress) || 'Selected Point'}`)
        .openPopup();

      pickupMarkerRef.current = marker;
      bounds.push([pickupCoords.lat, pickupCoords.lng]);
    }

    // Setup Dropoff Marker
    if (dropCoords) {
      const dropIcon = window.L.divIcon({
        html: `
          <div class="custom-marker drop-marker-pin">
            <div class="pin-pulse"></div>
            <div class="pin-icon-inner">🏁</div>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      const marker = window.L.marker([dropCoords.lat, dropCoords.lng], { icon: dropIcon })
        .addTo(map)
        .bindPopup(`<b>Destination</b><br/>${escapeHtml(dropAddress) || 'Selected Point'}`)
        .openPopup();

      dropMarkerRef.current = marker;
      bounds.push([dropCoords.lat, dropCoords.lng]);
    }

    // Draw route line if both are present
    if (pickupCoords && dropCoords) {
      const routeLine = window.L.polyline(
        [[pickupCoords.lat, pickupCoords.lng], [dropCoords.lat, dropCoords.lng]],
        {
          color: '#f97316',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 10',
          className: 'animated-polyline'
        }
      ).addTo(map);

      routePolylineRef.current = routeLine;

      // Zoom out to fit both coordinates
      map.fitBounds(window.L.latLngBounds(bounds), {
        padding: [60, 60],
        maxZoom: 16
      });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
  }, [pickupCoords, dropCoords]);

  // Attempt automatic device location centering and address retrieval on mount
  const tryAutoLocateOnStart = async (map) => {
    // 1. Try to geocode the user's registered profile address if available
    const profileAddress = [user?.address, user?.state, user?.pin_code].filter(Boolean).join(', ');
    
    if (profileAddress && profileAddress.trim() !== '' && !profileAddress.toLowerCase().includes('not provided')) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(profileAddress)}&format=json&limit=1`
        );
        if (response.ok) {
          const results = await response.json();
          if (results && results.length > 0) {
            const { lat, lon, display_name } = results[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            
            setPickupCoords({ lat: latitude, lng: longitude });
            setPickupAddress(profileAddress || display_name);
            map.setView([latitude, longitude], 16);
            return; // Successfully resolved profile address location
          }
        }
      } catch (err) {
        console.warn("Geocoding profile address failed, falling back to GPS:", err);
      }
    }

    // 2. Fallback to Browser Geolocation GPS
    const handleLocationFetch = (lat, lng) => {
      setPickupCoords({ lat, lng });
      setPickupAddress('Locating current address...');
      map.setView([lat, lng], 15);
      reverseGeocode(lat, lng, 'pickup');
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationFetch(latitude, longitude);
        },
        (error) => {
          console.warn("Auto location failed (or denied), falling back to default coords:", error.message);
          // Fallback to Hyderabad Kukatpally coordinates from user's screenshot
          const fallbackLat = 17.49664;
          const fallbackLng = 78.40140;
          handleLocationFetch(fallbackLat, fallbackLng);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      // Browser doesn't support Geolocation - Hyderabad fallback
      const fallbackLat = 17.49664;
      const fallbackLng = 78.40140;
      handleLocationFetch(fallbackLat, fallbackLng);
    }
  };

  // Reverse Geocoding via OSM Nominatim API
  const reverseGeocode = async (lat, lng, field) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      const addr = data.address;
      // Format a clean, human-friendly short address
      const building = addr.building || addr.amenity || addr.shop || '';
      const street = addr.road || addr.pedestrian || '';
      const area = addr.neighbourhood || addr.suburb || addr.city_district || '';
      const city = addr.city || addr.town || addr.village || '';
      
      const parts = [building, street, area, city].filter(Boolean);
      const shortAddress = parts.slice(0, 3).join(', ') || data.display_name;
      
      if (field === 'pickup') {
        setPickupAddress(shortAddress);
      } else {
        setDropAddress(shortAddress);
      }
    } catch {
      // Fallback display format in case network fails
      const fallback = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
      if (field === 'pickup') {
        setPickupAddress(fallback);
      } else {
        setDropAddress(fallback);
      }
    }
  };

  // Click handler on map
  const handleManualLocationSelected = (lat, lng, mode) => {
    if (mode === 'pickup') {
      setPickupCoords({ lat, lng });
      setPickupAddress('Locating address...');
      reverseGeocode(lat, lng, 'pickup');
    } else if (mode === 'drop') {
      setDropCoords({ lat, lng });
      setDropAddress('Locating address...');
      reverseGeocode(lat, lng, 'drop');
    }
    setSelectionMode(null); // Terminate selection mode
  };

  // Browser Geolocation getter for Current Location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('❌ Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPickupCoords({ lat: latitude, lng: longitude });
        setPickupAddress('Locating current address...');
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }

        reverseGeocode(latitude, longitude, 'pickup');
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert('⚠️ Unable to capture GPS location. Please pinpoint manually on the map.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!pickupCoords || !dropCoords) {
      alert('📍 Please set both pickup (From) and dropoff (To) coordinates on the map!');
      return;
    }

    alert(`🎉 Ride Locations Confirmed!
    
📍 Pickup Location (From): ${pickupAddress}
🏁 Dropping Point (To): ${dropAddress}

We are locating nearby drivers in your area...`);
    
    // Clear and redirect to homepage or bookings status page
    e.target.reset();
    setPickupCoords(null);
    setDropCoords(null);
    setPickupAddress('');
    setDropAddress('');
    setCurrentPage('booking-vehicles'); // Navigate to active booking status
  };

  return (
    <div className="book-ride-page">
      {/* Floating circular Close/Back Button */}
      <button 
        className="btn-back-home" 
        onClick={() => setCurrentPage('home')} 
        title="Go back to Home"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Dynamic Instruction Banner during selection state */}
      {selectionMode && (
        <div className="selection-banner">
          <div className="selection-banner-pulse"></div>
          <span>
            {selectionMode === 'pickup' 
              ? '📍 Click anywhere on the map to set your PICKUP location' 
              : '🏁 Click anywhere on the map to set your DROPOFF location'}
          </span>
        </div>
      )}

      {/* Map Element occupying backside background */}
      <div className="map-container-wrap">
        <div 
          ref={mapRef} 
          style={{ width: '100%', height: '100%' }}
          className={selectionMode === 'pickup' ? 'map-selecting-pickup' : selectionMode === 'drop' ? 'map-selecting-drop' : ''}
        >
          {!mapReady && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', background: '#f8fafc', color: '#64748b' }}>
              <Loader className="animate-spin" size={32} style={{ color: 'var(--color-accent)' }} />
              <p style={{ fontWeight: '600' }}>Loading interactive map components...</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Glassmorphism Form Widget */}
      <div className="booking-overlay-card">
        <div className="booking-form-header">
          <h2>Request a Ride</h2>
          <p>Pin your route coordinates on the map background</p>
        </div>

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Pickup Point (From) */}
          <div className="form-item-container">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>From (Pickup Location)</span>
              {pickupCoords && <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ Coords Set</span>}
            </label>
            <div className="input-with-icon">
              <span className="field-icon" style={{ color: '#22c55e' }}><MapPin size={16} /></span>
              <input 
                type="text" 
                required 
                placeholder="Enter pickup point or tap Locate on Map" 
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="input-field-custom"
              />
            </div>
            
            {/* Locate buttons under From */}
            <div className="location-actions-row">
              <button 
                type="button" 
                onClick={() => setSelectionMode(selectionMode === 'pickup' ? null : 'pickup')}
                className={`map-action-btn ${selectionMode === 'pickup' ? 'active-selecting' : ''}`}
              >
                📍 Locate on Map
              </button>
              <button 
                type="button" 
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="map-action-btn"
                style={{ opacity: isLocating ? 0.7 : 1 }}
              >
                {isLocating ? (
                  <>⏳ Locating...</>
                ) : (
                  <><Navigation size={12} /> Current Location</>
                )}
              </button>
            </div>
          </div>

          {/* Dropping Point (To) */}
          <div className="form-item-container">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>To (Dropping Point)</span>
              {dropCoords && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ Coords Set</span>}
            </label>
            <div className="input-with-icon">
              <span className="field-icon" style={{ color: '#ef4444' }}><MapPin size={16} /></span>
              <input 
                type="text" 
                required 
                placeholder="Enter destination or tap Locate on Map" 
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                className="input-field-custom"
              />
            </div>
            
            {/* Locate button under To */}
            <div className="location-actions-row">
              <button 
                type="button" 
                onClick={() => setSelectionMode(selectionMode === 'drop' ? null : 'drop')}
                className={`map-action-btn ${selectionMode === 'drop' ? 'active-selecting' : ''}`}
              >
                🏁 Locate on Map
              </button>
            </div>
          </div>

          {/* Hint alert */}
          {(!pickupCoords || !dropCoords) && (
            <div className="mobile-hide-tip">
              <AlertCircle size={16} style={{ flexShrink: 0, color: 'var(--color-accent)' }} />
              <span>Tip: Tap <strong>Locate on Map</strong> under From or To, then click directly on the map background to pinpoint addresses!</span>
            </div>
          )}

          {/* Submit Request */}
          <button type="submit" className="btn-submit-ride">
            Book Ride
          </button>
        </form>
      </div>
    </div>
  );
}
