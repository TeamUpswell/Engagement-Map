import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { createClient } from '@supabase/supabase-js';
import LoadingState from '../components/LoadingState';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const center = { lat: 9.0820, lng: 8.6753 };

const MapPage = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const { data, error } = await supabase.from('responses').select('id, lat, lng, answer1');
        if (error) throw error;
        setResponses(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <div>Error loading map: {error}</div>;

  return (
    <>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap
          mapContainerStyle={{ height: '100vh', width: '100%' }}
          center={center}
          zoom={6}
        >
          {responses.map(response => (
            <Marker
              key={response.id}
              position={{ lat: response.lat, lng: response.lng }}
              onClick={() => setSelected(response)}
            />
          ))}
          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div>{selected.answer1}</div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      <Link href="/">
        Go Home
      </Link>
    </>
  );
};

export default MapPage;