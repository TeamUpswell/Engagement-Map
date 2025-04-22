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
  const initialZoomRef = useRef<number>(12); // Store initial zoom level
  const centerRef = useRef<google.maps.LatLng | null>(null); // Store initial center

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    // Make sure Google Maps API is loaded
    if (window.google && window.google.maps) {
      console.log("Initializing map instance");
      const initialCenter = { lat: 45.5101618, lng: -122.6961295 }; // Portland, OR
      const initialZoom = 12;
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      });
      
      // Store initial settings for reference
      initialZoomRef.current = initialZoom;
      centerRef.current = new google.maps.LatLng(initialCenter.lat, initialCenter.lng);
      
      // Add listener to store zoom changes by user
      mapInstanceRef.current.addListener('zoom_changed', () => {
        if (mapInstanceRef.current) {
          initialZoomRef.current = mapInstanceRef.current.getZoom() || initialZoom;
        }
      });
      
      // Add listener to store center changes by user
      mapInstanceRef.current.addListener('center_changed', () => {
        if (mapInstanceRef.current) {
          centerRef.current = mapInstanceRef.current.getCenter() || null;
        }
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
        
        markersRef.current.push(marker);
      }
    });

    // Adjust bounds if we have multiple markers, but limit zoom
    if (markersRef.current.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition() as google.maps.LatLng);
      });
      
      // Fit bounds but then check if zoom is too close
      mapInstanceRef.current.fitBounds(bounds);
      
      // Wait for fitBounds to complete (it's async)
      setTimeout(() => {
        if (mapInstanceRef.current) {
          // If zoom is too close (higher number = closer zoom)
          const currentZoom = mapInstanceRef.current.getZoom() || 0;
          if (currentZoom > 15) {
            mapInstanceRef.current.setZoom(15); // Set a maximum zoom level
          }
        }
      }, 100);
    } 
    // If only one marker or no markers
    else if (markersRef.current.length === 1) {
      // For a single marker, center but use a fixed zoom
      const position = markersRef.current[0].getPosition();
      if (position) {
        mapInstanceRef.current.setCenter(position);
        mapInstanceRef.current.setZoom(14); // Good zoom level for a single point
      }
    } 
    // If no markers, return to original view
    else if (markersRef.current.length === 0 && centerRef.current) {
      mapInstanceRef.current.setCenter(centerRef.current);
      mapInstanceRef.current.setZoom(initialZoomRef.current);
    }
  }, [responses]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', ...style }} />
  );
});

export default MapComponent;
