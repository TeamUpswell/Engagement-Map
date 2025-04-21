"use client";

import { useState, useEffect, useRef } from "react";

export default function MapComponent({ responses, style }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log("Map component mounted, responses:", responses?.length || 0);

    // Check if Google Maps API is available
    if (window.google && window.google.maps) {
      console.log("Google Maps API is available on mount");
    } else {
      console.log("Google Maps API is NOT available on mount");
    }

    return () => {
      console.log("Map component unmounting");
    };
  }, []);

  // Create map instance when Google Maps is loaded
  useEffect(() => {
    if (!mapRef.current) {
      console.log("Map container ref not available");
      return;
    }

    if (mapInstanceRef.current) {
      console.log("Map instance already exists");
      return;
    }

    // Wait for Google Maps to be available
    const checkGoogleMaps = () => {
      if (!window.google || !window.google.maps) {
        console.log("Waiting for Google Maps to load...");
        setTimeout(checkGoogleMaps, 500);
        return;
      }

      try {
        console.log("Creating map instance now");
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 45.5101618, lng: -122.6961295 },
          zoom: 13,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        });

        mapInstanceRef.current.addListener("tilesloaded", () => {
          console.log("Map tiles loaded");
          setMapLoaded(true);
        });

        console.log("Map instance created");

        // Add markers right away if we have responses
        if (responses && responses.length > 0) {
          addMarkersToMap(responses);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError(`Failed to initialize map: ${error.message}`);
      }
    };

    // Start checking
    checkGoogleMaps();

    return () => {
      if (mapInstanceRef.current) {
        // Clean up map (not always necessary with Google Maps)
        console.log("Cleaning up map instance");
      }
    };
  }, [mapRef]);

  // Function to add markers to the map
  function addMarkersToMap(mapResponses) {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) {
      console.log("Can't add markers, map not ready");
      return;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    console.log(`Adding ${mapResponses.length} markers to map`);

    if (mapResponses.length === 0) {
      console.log("No responses to show on map");
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let validMarkers = 0;

    mapResponses.forEach((response) => {
      if (!response.latitude || !response.longitude) {
        console.log("Skipping response without coordinates");
        return;
      }

      try {
        let iconUrl = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        if (response.ready_for_vaccine === "yes") {
          iconUrl = "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
        } else if (response.ready_for_vaccine === "no") {
          iconUrl = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
        } else if (response.ready_for_vaccine === "maybe") {
          iconUrl = "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
        }

        const marker = new window.google.maps.Marker({
          position: { lat: response.latitude, lng: response.longitude },
          map: mapInstanceRef.current,
          icon: iconUrl,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin-top: 0; font-size: 16px;">Survey Response</h3>
              <p><strong>Ready for vaccine:</strong> ${
                response.ready_for_vaccine || "Unknown"
              }</p>
              <p><strong>Cares for girl:</strong> ${
                response.cares_for_girl ? "Yes" : "No"
              }</p>
              <p><strong>Received HPV dose:</strong> ${
                response.received_hpv_dose ? "Yes" : "No"
              }</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
        bounds.extend(marker.getPosition());
        validMarkers++;
      } catch (error) {
        console.error("Error creating marker:", error);
      }
    });

    if (validMarkers > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      // Don't zoom in too far
      google.maps.event.addListenerOnce(
        mapInstanceRef.current,
        "bounds_changed",
        () => {
          if (mapInstanceRef.current.getZoom() > 15) {
            mapInstanceRef.current.setZoom(15);
          }
        }
      );
      console.log(`Added ${validMarkers} markers and adjusted bounds`);
    } else {
      console.log("No valid markers to add");
    }
  }

  // Add/update markers when responses change and map is ready
  useEffect(() => {
    if (!mapLoaded) {
      console.log("Map not loaded yet, waiting to add markers");
      return;
    }

    console.log("Responses or map changed, updating markers");
    addMarkersToMap(responses);
  }, [responses, mapLoaded]);

  if (mapError) {
    return (
      <div
        style={{
          ...style,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
          padding: "20px",
        }}
      >
        <h3 style={{ color: "#dc3545" }}>Map Error</h3>
        <p>{mapError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", ...style }}>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          border: "1px solid #ddd",
        }}
      />
      {!mapLoaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                margin: "0 auto 10px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p>Loading map...</p>
            <style jsx>{`
              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
