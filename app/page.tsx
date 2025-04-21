"use client";

import { useEffect, useState } from "react";
import Map from "../components/Map";
import { supabase } from "../lib/supabase";

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data, error } = await supabase.from("locations").select("*");

        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  const mapMarkers = locations.map((loc) => ({
    position: { lat: loc.lat, lng: loc.lng },
    title: loc.name,
  }));

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Engagement Map</h1>
      {loading ? <p>Loading map data...</p> : <Map markers={mapMarkers} />}
    </main>
  );
}
