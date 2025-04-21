import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface MapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  markers?: Array<{
    position: google.maps.LatLngLiteral;
    title?: string;
  }>;
}

export default function Map({
  center = { lat: 37.7749, lng: -122.4194 },
  zoom = 10,
  markers = [],
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
      });

      const { Map } = (await loader.importLibrary(
        "maps"
      )) as google.maps.MapsLibrary;

      if (mapRef.current) {
        const mapInstance = new Map(mapRef.current, {
          center,
          zoom,
          mapId: "basic-map",
        });

        setMap(mapInstance);
      }
    };

    initMap();
  }, [center, zoom]);

  useEffect(() => {
    if (map) {
      // Clear existing markers
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });

      // Add new markers
      markers.forEach((marker) => {
        new google.maps.Marker({
          position: marker.position,
          map,
          title: marker.title,
        });
      });
    }
  }, [map, markers]);

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
}
