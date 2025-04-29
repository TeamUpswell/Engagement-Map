"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import FilterButtonNew from "./FilterButtonNew";
import MapComponent from "./Map";
import GoogleMapsLoader from "./GoogleMapsLoader";
import { healthcareCenters } from "../data/healthcareCenters";
import { pharmacies } from "../data/pharmacies"; // Import the pharmacies data

// Define types for responses
interface Response {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string; // Make sure this property is included
  ready_for_vaccine?: string;
  cares_for_girl?: boolean;
  received_hpv_dose?: boolean;
  joined_whatsapp?: boolean;
  // Add any other fields from your response object
}

export default function MapContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [responses, setResponses] = useState<Response[]>([]);
  const [filters, setFilters] = useState({
    all: true,
    yesVaccine: false,
    noVaccine: false,
    maybeVaccine: false,
    caresForGirl: false,
    receivedDose: false,
  });
  const [counts, setCounts] = useState({
    total: 0,
    yesVaccine: 0,
    noVaccine: 0,
    maybeVaccine: 0,
    caresForGirl: 0,
    receivedDose: 0,
  });

  const [showHealthFacilities, setShowHealthFacilities] = useState(true);
  const [showPharmacies, setShowPharmacies] = useState(false); // Start with pharmacies hidden

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching data from Supabase...");
        const { data, error } = await supabase
          .from("survey_responses")
          .select("*");

        if (error) {
          console.error("Supabase error:", error);
          return;
        }

        console.log("Data received:", data?.length || 0, "records");

        // Calculate counts
        const newCounts = {
          total: data?.length || 0,
          yesVaccine:
            data?.filter((r: Response) => r.ready_for_vaccine === "yes")
              .length || 0,
          noVaccine:
            data?.filter((r: Response) => r.ready_for_vaccine === "no")
              .length || 0,
          maybeVaccine:
            data?.filter((r: Response) => r.ready_for_vaccine === "maybe")
              .length || 0,
          caresForGirl:
            data?.filter((r: Response) => r.cares_for_girl).length || 0,
          receivedDose:
            data?.filter((r: Response) => r.received_hpv_dose).length || 0,
        };

        setCounts(newCounts);
        setResponses((data as Response[]) || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
        console.log("Loading state set to false");
      }
    }

    fetchData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterName: string): void => {
    if (filterName === "all") {
      // If 'All' is clicked, disable other filters
      setFilters({
        all: true,
        yesVaccine: false,
        noVaccine: false,
        maybeVaccine: false,
        caresForGirl: false,
        receivedDose: false,
      });
    } else {
      // If any other filter is clicked, disable 'All'
      setFilters({
        ...filters,
        all: false,
        [filterName]: !filters[filterName],
      });

      // If no filters are selected, enable 'All'
      const updatedFilters = {
        ...filters,
        all: false,
        [filterName]: !filters[filterName],
      };

      const hasActiveFilter = Object.keys(updatedFilters).some(
        (key) => key !== "all" && updatedFilters[key]
      );

      if (!hasActiveFilter) {
        updatedFilters.all = true;
      }

      setFilters(updatedFilters);
    }
  };

  // Filter responses based on active filters
  const filteredResponses = responses.filter((response) => {
    if (filters.all) return true;

    let match = false;
    if (filters.yesVaccine && response.ready_for_vaccine === "yes")
      match = true;
    if (filters.noVaccine && response.ready_for_vaccine === "no") match = true;
    if (filters.maybeVaccine && response.ready_for_vaccine === "maybe")
      match = true;
    if (filters.caresForGirl && response.cares_for_girl) match = true;
    if (filters.receivedDose && response.received_hpv_dose) match = true;

    return match;
  });

  // Add this to your form submission handler function
  const handleSurveySubmit = async (formData) => {
    try {
      console.log("Form submission started with data:", formData);

      // Add validation for required fields
      if (!formData.latitude || !formData.longitude) {
        console.error("Missing location data");
        alert("Location data is required. Please allow location access.");
        return;
      }

      const { data, error } = await supabase
        .from("survey_responses") // Make sure this table name is correct
        .insert([formData]);

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        // Check for specific error types
        if (error.code === "23505") {
          alert("You've already submitted this survey.");
          return;
        }

        if (error.code.startsWith("PGRST")) {
          alert("There's an issue with the API. Please try again later.");
          return;
        }

        throw error; // Let the catch block handle other errors
      }

      console.log("Form submitted successfully:", data);
      // Show success message or redirect
    } catch (error) {
      console.error("Form submission failed:", error);

      // Network related error check
      if (!navigator.onLine) {
        alert(
          "You appear to be offline. Please check your internet connection and try again."
        );
        return;
      }

      // Show user-friendly error message
      alert("An error occurred while submitting the survey. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <GoogleMapsLoader />

      {/* Simple header */}
      <header
        style={{
          backgroundColor: "#f8f9fa",
          padding: "10px 20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "20px", marginBottom: "10px" }}>
          Engagement Map
        </h1>

        {/* Filters and Counts */}
        {!isLoading && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {/* Filter toggle buttons */}
              <FilterButtonNew
                active={filters.all}
                onClick={() => handleFilterChange("all")}
                count={counts.total}
                label="All Responses"
              />
              <FilterButtonNew
                active={filters.yesVaccine}
                onClick={() => handleFilterChange("yesVaccine")}
                count={counts.yesVaccine}
                label="Ready for Vaccine"
              />
              <FilterButtonNew
                active={filters.noVaccine}
                onClick={() => handleFilterChange("noVaccine")}
                count={counts.noVaccine}
                label="Not Ready for Vaccine"
              />
              <FilterButtonNew
                active={filters.maybeVaccine}
                onClick={() => handleFilterChange("maybeVaccine")}
                count={counts.maybeVaccine}
                label="Maybe Ready"
              />
              <FilterButtonNew
                active={filters.caresForGirl}
                onClick={() => handleFilterChange("caresForGirl")}
                count={counts.caresForGirl}
                label="Cares for Girl"
              />
              <FilterButtonNew
                active={filters.receivedDose}
                onClick={() => handleFilterChange("receivedDose")}
                count={counts.receivedDose}
                label="Received HPV Dose"
              />
            </div>

            {/* Second row with facility toggles */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <FilterButtonNew
                active={showHealthFacilities}
                onClick={() => setShowHealthFacilities(!showHealthFacilities)}
                count={healthcareCenters.length}
                label={`${
                  showHealthFacilities ? "Hide" : "Show"
                } Health Facilities`}
              />

              {/* New toggle for pharmacies */}
              <FilterButtonNew
                active={showPharmacies}
                onClick={() => setShowPharmacies(!showPharmacies)}
                count={pharmacies.length}
                label={`${showPharmacies ? "Hide" : "Show"} Pharmacies`}
              />
            </div>

            {/* Summary count */}
            <div style={{ fontSize: "14px" }}>
              Currently showing {filteredResponses.length} of {counts.total}{" "}
              total responses
              {showHealthFacilities &&
                ` and ${healthcareCenters.length} health facilities`}
              {showPharmacies && ` and ${pharmacies.length} pharmacies`}
            </div>
          </div>
        )}
      </header>

      <main style={{ flex: 1, width: "100%" }}>
        {isLoading ? (
          <div
            style={{
              height: "calc(100vh - 120px)", // Adjusted for header with filters
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p>Loading map data...</p>
          </div>
        ) : (
          <MapComponent
            responses={filteredResponses}
            showHealthFacilities={showHealthFacilities}
            showPharmacies={showPharmacies} // Pass the pharmacies toggle state
            style={{ width: "100%", height: "calc(100vh - 120px)" }}
          />
        )}
      </main>
    </div>
  );
}
