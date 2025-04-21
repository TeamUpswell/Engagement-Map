import { useRef, useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  markers?: Array<{
    position: google.maps.LatLngLiteral;
    title?: string;
    responseType?: string; // Add this to differentiate between response types
  }>;
}

export default function Map({
  center = { lat: 45.5101618, lng: -122.6961295 },
  zoom = 14,
  markers = [],
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      try {
        console.log("Initializing Google Maps...");
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
        });

        // Use proper type assertion
        const { Map } = await loader.importLibrary("maps") as unknown as {
          Map: { new(el: HTMLElement, options: google.maps.MapOptions): google.maps.Map }
        };

        if (mapRef.current) {
          console.log("Creating map with center:", center);
          const newMap = new Map(mapRef.current, {
            center,
            zoom,
            mapId: "DEMO_MAP_ID",
          });
          setMap(newMap);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();
  }, [center, zoom]);

  useEffect(() => {
    if (map) {
      console.log("Adding markers to map:", markers.length);
      
      // Clear existing markers
      mapMarkers.forEach(marker => marker.setMap(null));
      
      // Create new markers with custom icons
      const newMarkers = markers.map(({ position, title, responseType }) => {
        // Choose icon based on response type
        let iconUrl = '/icons/default-person.png';
        
        // Default to a standard icon if the custom ones don't exist yet
        if (responseType === 'yes') {
          iconUrl = '/icons/positive-response.png';
        } else if (responseType === 'no') {
          iconUrl = '/icons/negative-response.png';
        } else if (responseType === 'maybe') {
          iconUrl = '/icons/unsure-response.png';
        }
        
        // Fallback to a standard Google Maps icon if the custom one isn't found
        const icon = {
          url: iconUrl,
          // Use scaledSize only if Google Maps is fully loaded
          scaledSize: new google.maps.Size(40, 40)
        };
        
        const marker = new google.maps.Marker({
          position,
          map,
          title,
          icon
        });
        
        // Add info window when marker is clicked
        const infoWindow = new google.maps.InfoWindow({
          content: `<div>
            <h3>${title}</h3>
            <p>Response Type: ${responseType}</p>
          </div>`
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        return marker;
      });
      
      setMapMarkers(newMarkers);
    }
  }, [map, markers]);

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
}
