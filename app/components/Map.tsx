'use client';

import { useState, useEffect, useRef, memo } from 'react';

// Define types for Response and props
interface Response {
  id: string;
  latitude: number;
  longitude: number;
  ready_for_vaccine?: string;
  cares_for_girl?: boolean;
  received_hpv_dose?: boolean;
  joined_whatsapp?: boolean;
}

interface MapProps {
  responses: Response[];
  style?: React.CSSProperties;
}

// Use memo to prevent unnecessary re-renders
const MapComponent = memo(function MapComponent({ responses, style }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    // Make sure Google Maps API is loaded
    if (window.google && window.google.maps) {
      console.log("Initializing map instance");
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 45.5101618, lng: -122.6961295 }, // Portland, OR
        zoom: 13,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      });
    }
  }, []);

  // Handle markers separately when responses change
  useEffect(() => {
    if (!mapInstanceRef.current || !responses) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    responses.forEach(response => {
      if (response.latitude && response.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: response.latitude, lng: response.longitude },
          map: mapInstanceRef.current,
          title: `Response ${response.id}`,
        });

        // You could add click listeners here for info windows
        
        markersRef.current.push(marker);
      }
    });

    // Optional: adjust map bounds to fit all markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition() as google.maps.LatLng);
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [responses]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', ...style }} />
  );
});

export default MapComponent;
