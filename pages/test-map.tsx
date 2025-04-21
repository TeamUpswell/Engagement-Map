import { useEffect, useRef } from 'react';
import Head from 'next/head';

export default function TestMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 45.5101618, lng: -122.6961295 },
        zoom: 14,
      });

      new google.maps.Marker({
        position: { lat: 45.5101618, lng: -122.6961295 },
        map,
        title: 'Test Marker',
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      delete window.initMap;
    };
  }, []);

  return (
    <div style={{ padding: 0, margin: 0, minHeight: '100vh' }}>
      <Head>
        <title>Test Map</title>
      </Head>
      
      <h1 style={{ padding: '20px', margin: 0 }}>Test Map Page</h1>
      
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: 'calc(100vh - 80px)' }}
      ></div>
    </div>
  );
}