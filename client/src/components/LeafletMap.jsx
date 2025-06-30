// src/components/LeafletMap.jsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "../MapView.css";

const LeafletMap = ({ site, zoom = 18 }) => {
  const lat = +site.latitude;
  const lng = +site.longitude;

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // initialize map only once
    mapRef.current = L.map("map").setView([lat, lng], zoom);

    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics",
        maxZoom: 24,
      }
    ).addTo(mapRef.current);

    // Labels overlay (hybrid)
    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Labels © Esri",
        pane: "overlayPane",
      }
    ).addTo(mapRef.current);

    // Example marker for a river site
    const marker = L.marker([lat, lng]).addTo(mapRef.current);
    marker.bindPopup(`
      <div class="usgs-popup">
        <h5>${site.siteName}</h5>
        <p><strong>Site Code:</strong>${site.siteCode}</p>
        <p><strong>Flow:</strong>${site.flow}</p>
      </div>
    `);
  }, [lat, lng, zoom]);

  return <div id="map" className="map-container" />;
};

export default LeafletMap;
