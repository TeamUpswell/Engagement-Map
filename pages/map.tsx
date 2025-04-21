// pages/map.tsx
import { useEffect, useState } from "react";
import Head from "next/head";
import Navigation from "../components/Navigation";
import Map from "../components/Map";
import LoadingState from "../components/LoadingState";
import { supabase } from "../lib/supabase";
import { ResponseData } from "../types";
import styles from "../styles/Home.module.css";

export default function MapPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching data from Supabase...");
        // Change table name from "responses" to "survey_responses"
        const { data, error } = await supabase.from("survey_responses").select("*");

        if (error) {
          console.error("Supabase error:", error);
          setErrorDetails(error);
          throw error;
        }

        console.log("Data received:", data);

        // Check if data has the expected format
        if (data && data.length > 0) {
          const validData = data.filter(
            (item) =>
              typeof item.latitude === "number" &&
              typeof item.longitude === "number"
          );
          console.log("Valid data points:", validData.length);
          setResponses(validData);
        } else {
          console.log("No data received or empty array");
          setResponses([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Error - Next Maps App</title>
        </Head>
        <main className={styles.main}>
          <Navigation />
          <div className={styles.content}>
            <h2 className={styles.title}>Error</h2>
            <p className={styles["error-message"]}>{error}</p>
            {errorDetails && (
              <div className={styles["error-details"]}>
                <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  const markers = responses.map((response) => ({
    position: { lat: response.latitude, lng: response.longitude },
    title: `${response.ready_for_vaccine} - ${response.address}`,
    responseType: response.ready_for_vaccine,
  }));

  console.log("Rendering map with markers:", markers);

  return (
    <div className={styles.container}>
      <Head>
        <title>Map View - Next Maps App</title>
        <meta name="description" content="View survey responses on a map" />
      </Head>

      <main className={styles.main}>
        <Navigation />
        <div className={styles["map-container"]}>
          {responses.length === 0 ? (
            <div className={styles.content}>
              <p>No data available to display on the map.</p>
              <p>This could mean your Supabase table is empty.</p>
            </div>
          ) : (
            <Map markers={markers} center={markers[0]?.position} />
          )}
        </div>
      </main>
    </div>
  );
}
