import { useRef, useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  markers?: Array<{
    position: google.maps.LatLngLiteral;
    title?: string;
    responseType?: string;
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
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Map component mounted");
    return () => {
      console.log("Map component unmounted");
    };
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log("Google Maps API Key exists:", !!apiKey);
    
    if (!apiKey) {
      setMapError("Google Maps API key is missing");
      return;
    }

    const initMap = async () => {
      try {
        console.log("Initializing Google Maps...");
        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["maps", "marker"]
        });

        const { Map } = await loader.importLibrary("maps");
        
        if (!mapRef.current) {
          console.error("Map container ref is null");
          setMapError("Map container not found");
          return;
        }
        
        console.log("Creating map with center:", center);
        const newMap = new Map(mapRef.current, {
          center,
          zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        });
        
        setMap(newMap);
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to initialize Google Maps");
      }
    };

    initMap();
  }, [center, zoom]);

  useEffect(() => {
    if (!map) return;
    
    console.log("Adding markers to map:", markers.length);
    
    // Clear existing markers
    mapMarkers.forEach(marker => marker.setMap(null));
    
    try {
      // Create new markers with blue dots
      const newMarkers = markers.map(({ position, title, responseType }) => {
        // Log each marker position for debugging
        console.log("Creating marker at:", position);
        
        const marker = new google.maps.Marker({
          position,
          map,
          title,
          // Use Google's built-in blue dot marker without scaling for now
          icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        });
        
        // Add info window when marker is clicked
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 8px;">
            <h4 style="margin-top: 0;">${title || 'Response'}</h4>
            <p style="margin-bottom: 0;">Ready for vaccine: ${responseType || 'Unknown'}</p>
          </div>`
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        return marker;
      });
      
      setMapMarkers(newMarkers);
      console.log("Created markers:", newMarkers.length);
    } catch (error) {
      console.error("Error creating markers:", error);
    }
  }, [map, markers]);

  if (mapError) {
    return (
      <div style={{ 
        width: "100%", 
        height: "500px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        border: "1px solid #ddd",
        borderRadius: "4px",
      }}>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ color: "#dc3545" }}>Map Error</h3>
          <p>{mapError}</p>
          <p>Please check your browser console for more details.</p>
        </div>
      </div>
    );
  }

  console.log("Rendering map container, map exists:", !!map);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "70vh" }} />;
}
