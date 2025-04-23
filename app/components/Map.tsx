'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { healthcareCenters, HealthcareCenter } from '../data/healthcareCenters';
import { pharmacies } from '../data/pharmacies';

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
  showHealthFacilities?: boolean;
  showPharmacies?: boolean; // Add new prop
}

// Use memo to prevent unnecessary re-renders
const MapComponent = memo(function MapComponent({ 
  responses, 
  style,
  showHealthFacilities = true,
  showPharmacies = false // Default to not showing pharmacies
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const facilityMarkersRef = useRef<google.maps.Marker[]>([]);
  const pharmacyMarkersRef = useRef<google.maps.Marker[]>([]); // Add ref for pharmacy markers
  const initialZoomRef = useRef<number>(12);
  const centerRef = useRef<google.maps.LatLng | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    if (window.google && window.google.maps) {
      console.log("Initializing map instance");
      const initialCenter = { lat: 8.87, lng: 7.22 }; // Centered on your healthcare facilities area
      const initialZoom = 12;
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      });
      
      // Create info window instance
      setInfoWindow(new google.maps.InfoWindow());
      
      // Store initial settings
      initialZoomRef.current = initialZoom;
      centerRef.current = new google.maps.LatLng(initialCenter.lat, initialCenter.lng);
      
      // Add listeners to store user map interactions
      mapInstanceRef.current.addListener('zoom_changed', () => {
        if (mapInstanceRef.current) {
          initialZoomRef.current = mapInstanceRef.current.getZoom() || initialZoom;
        }
      });
      
      mapInstanceRef.current.addListener('center_changed', () => {
        if (mapInstanceRef.current) {
          centerRef.current = mapInstanceRef.current.getCenter() || null;
        }
      });
    }
  }, []);

  // Add healthcare facilities to the map
  useEffect(() => {
    if (!mapInstanceRef.current || !infoWindow) return;

    // Clear existing facility markers
    facilityMarkersRef.current.forEach(marker => marker.setMap(null));
    facilityMarkersRef.current = [];
    
    // Only add markers if showHealthFacilities is true
    if (!showHealthFacilities) return;

    // Custom icon for healthcare facilities - REDUCED SIZE HERE
    const healthFacilityIcon = {
      url: '/images/purp.png',
      scaledSize: new google.maps.Size(20, 20), // Reduced from 20x20 to 16x16
    };

    // Add healthcare facility markers
    healthcareCenters.forEach((facility) => {
      if (facility.latitude && facility.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: facility.latitude, lng: facility.longitude },
          map: mapInstanceRef.current,
          title: facility.name,
          icon: healthFacilityIcon,
          zIndex: 2,
        });
        
        // Add click listener to show info about the facility
        marker.addListener('click', () => {
          const content = `
            <div style="padding: 10px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0;">${facility.name}</h3>
              <p style="margin: 0 0 5px 0;"><strong>Address:</strong> ${facility.address}</p>
              <p style="margin: 0 0 5px 0;"><strong>Immunization Days:</strong> ${facility.days_of_immunization || 'Not specified'}</p>
              <p style="margin: 0 0 5px 0;"><strong>Hours:</strong> ${facility.hours_of_work || 'Not specified'}</p>
            </div>
          `;
          
          infoWindow.setContent(content);
          infoWindow.open(mapInstanceRef.current, marker);
        });
        
        facilityMarkersRef.current.push(marker);
      }
    });
  }, [showHealthFacilities, infoWindow]);

  // Add pharmacies to the map - NEW EFFECT
  useEffect(() => {
    if (!mapInstanceRef.current || !infoWindow) return;

    // Clear existing pharmacy markers
    pharmacyMarkersRef.current.forEach(marker => marker.setMap(null));
    pharmacyMarkersRef.current = [];
    
    // Only add markers if showPharmacies is true
    if (!showPharmacies) return;

    // Custom icon for pharmacies - REDUCED SIZE HERE
    const pharmacyIcon = {
      url: '/images/pharma.png',
      scaledSize: new google.maps.Size(20, 20), // Reduced from 24x24
    };

    // Add pharmacy markers
    pharmacies.forEach((pharmacy) => {
      if (pharmacy.latitude && pharmacy.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: pharmacy.latitude, lng: pharmacy.longitude },
          map: mapInstanceRef.current,
          title: pharmacy.name,
          icon: pharmacyIcon,
          zIndex: 2,
        });
        
        // Add click listener to show info about the pharmacy
        marker.addListener('click', () => {
          const content = `
            <div style="padding: 10px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0;">${pharmacy.name}</h3>
              <p style="margin: 0 0 5px 0;"><strong>Address:</strong> ${pharmacy.address}</p>
              <p style="margin: 0 0 5px 0;"><strong>LGA:</strong> ${pharmacy.lga || 'Not specified'}</p>
              ${pharmacy.days_of_immunization ? `<p style="margin: 0 0 5px 0;"><strong>Immunization Days:</strong> ${pharmacy.days_of_immunization}</p>` : ''}
              ${pharmacy.hours_of_work ? `<p style="margin: 0 0 5px 0;"><strong>Hours:</strong> ${pharmacy.hours_of_work}</p>` : ''}
            </div>
          `;
          
          infoWindow.setContent(content);
          infoWindow.open(mapInstanceRef.current, marker);
        });
        
        pharmacyMarkersRef.current.push(marker);
      }
    });
  }, [showPharmacies, infoWindow]); // This effect only runs when showPharmacies changes

  // Handle response markers separately when responses change
  useEffect(() => {
    if (!mapInstanceRef.current || !responses || !infoWindow) return;

    // Clear existing response markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Custom icon for person markers
    const personIcon = {
      url: '/images/person.png',  // Path to your person.png icon
      scaledSize: new google.maps.Size(24, 24),  // Adjust size as needed
    };

    // Add new response markers
    responses.forEach(response => {
      if (response.latitude && response.longitude) {
        // Create a marker for each response with the person icon
        const marker = new window.google.maps.Marker({
          position: { lat: response.latitude, lng: response.longitude },
          map: mapInstanceRef.current,
          title: `Response ${response.id}`,
          icon: personIcon,  // Use the custom person icon
          zIndex: 1  // Lower z-index than health facilities
        });
        
        // Add click listener to show info about the response
        marker.addListener('click', () => {
          const content = `
            <div style="padding: 10px; max-width: 200px;">
              <h4 style="margin: 0 0 5px 0;">Survey Response</h4>
              <p style="margin: 0 0 3px 0;">Ready for vaccine: ${response.ready_for_vaccine || 'Not specified'}</p>
              ${response.cares_for_girl ? '<p style="margin: 0 0 3px 0;">Cares for girl: Yes</p>' : ''}
              ${response.received_hpv_dose ? '<p style="margin: 0 0 3px 0;">Received HPV dose: Yes</p>' : ''}
              ${response.joined_whatsapp ? '<p style="margin: 0 0 3px 0;">Joined WhatsApp: Yes</p>' : ''}
            </div>
          `;
          
          infoWindow.setContent(content);
          infoWindow.open(mapInstanceRef.current, marker);
        });
        
        markersRef.current.push(marker);
      }
    });

    // Update bounds calculation with all visible markers
    const allVisibleMarkers = [...markersRef.current];
    if (showHealthFacilities) {
      allVisibleMarkers.push(...facilityMarkersRef.current);
    }
    if (showPharmacies) {
      allVisibleMarkers.push(...pharmacyMarkersRef.current);
    }

    // Adjust map bounds based on visible markers (as you had before)
    if (allVisibleMarkers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      allVisibleMarkers.forEach(marker => {
        bounds.extend(marker.getPosition() as google.maps.LatLng);
      });
      
      mapInstanceRef.current.fitBounds(bounds);
      
      // Limit maximum zoom
      setTimeout(() => {
        if (mapInstanceRef.current) {
          const currentZoom = mapInstanceRef.current.getZoom() || 0;
          if (currentZoom > 15) {
            mapInstanceRef.current.setZoom(15);
          }
        }
      }, 100);
    } 
    else if (allVisibleMarkers.length === 1) {
      const position = allVisibleMarkers[0].getPosition();
      if (position) {
        mapInstanceRef.current.setCenter(position);
        mapInstanceRef.current.setZoom(14);
      }
    }
    else if (allVisibleMarkers.length === 0 && centerRef.current) {
      mapInstanceRef.current.setCenter(centerRef.current);
      mapInstanceRef.current.setZoom(initialZoomRef.current);
    }
  }, [responses, showHealthFacilities, showPharmacies, infoWindow]);

  // Return just the map div, not the button
  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', ...style }} />
  );
});

export default MapComponent;
