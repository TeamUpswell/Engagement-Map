'use client';

import { useEffect, useState } from 'react';

export default function GoogleMapsLoader() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log("Google Maps already loaded");
      setLoaded(true);
      return;
    }

    // Global variable to prevent multiple loads
    if (window.__GOOGLE_MAPS_LOADING__) {
      console.log("Google Maps loading already in progress");
      return;
    }

    window.__GOOGLE_MAPS_LOADING__ = true;

    console.log("Loading Google Maps API...");
    
    // Check environment variable
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key is missing!");
      setError("Google Maps API key is missing!");
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("Google Maps API loaded successfully");
      setLoaded(true);
      window.__GOOGLE_MAPS_LOADING__ = false;
    };
    
    script.onerror = (e) => {
      console.error("Error loading Google Maps API:", e);
      setError("Failed to load Google Maps");
      window.__GOOGLE_MAPS_LOADING__ = false;
    };
    
    document.head.appendChild(script);
    
    return () => {
      window.__GOOGLE_MAPS_LOADING__ = false;
    };
  }, []);
  
  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: '5px',
        right: '5px',
        padding: '8px 12px',
        backgroundColor: '#f44336',
        color: 'white',
        borderRadius: '4px',
        fontSize: '14px',
        zIndex: 9999,
      }}>
        {error}
      </div>
    );
  }
  
  return null;
}