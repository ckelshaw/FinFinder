// src/components/LeafletMap.jsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "../MapView.css";

const LeafletMap = ({ sites = [], selectedSite, zoom = 18, onSiteSelect, showPreview }) => {

  // Fallback to default if site is missing or doesn't have lat/lng
  const defaultLat = 44.047313;
  const defaultLng = -114.191688;

  const lat = sites[0]?.latitude ? +sites[0].latitude : defaultLat;
  const lng = sites[0]?.longitude ? +sites[0].longitude : defaultLng;
  zoom = sites[0]?.latitude ? 18 : 6;

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map("map").setView([lat, lng], zoom);

    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics",
        maxZoom: 24,
      }
    ).addTo(mapRef.current);

    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Labels © Esri",
        pane: "overlayPane",
      }
    ).addTo(mapRef.current);
  }, []);

  useEffect(() => {
  if (!mapRef.current) return;

  // Determine which sites to show
  const displaySites = selectedSite ? [selectedSite] : sites;
  if (displaySites.length === 0) return;

  // Clear old markers
  markersRef.current.forEach((marker) => mapRef.current.removeLayer(marker));
  markersRef.current = [];

  const bounds = L.latLngBounds([]);
  const validSites = displaySites.filter(site => site.latitude && site.longitude);

  validSites.forEach((site) => {
    const lat = parseFloat(site.latitude);
    const lng = parseFloat(site.longitude);

    const marker = L.marker([lat, lng]).addTo(mapRef.current);
    marker.bindPopup(`
      <div class="usgs-popup">
        <h5>${site.siteName}</h5>
        <p><strong>Site Code:</strong> ${site.siteCode}</p>
        <p><strong>Flow:</strong> ${site.flow} cfs</p>
        <button class="btn btn-primary select-site-btn">Select</button>
      </div>
    `);

    marker.on("popupopen", (e) => {
      const popupEl = e.popup.getElement();
      const button = popupEl.querySelector(".select-site-btn");

      if (button) {
        button.addEventListener("click", () => {
          onSiteSelect(site);
          marker.closePopup();
          button.style.display = 'none';
        });
      }
    });

    markersRef.current.push(marker);
    bounds.extend([lat, lng]);
  });

  // Adjust zoom
  if (validSites.length === 1) {
    const single = validSites[0];
    const lat = parseFloat(single.latitude);
    const lng = parseFloat(single.longitude);
    mapRef.current.setView([lat, lng], 16); // Set tighter zoom for 1 marker
  } else if (bounds.isValid()) {
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }
}, [sites, selectedSite]);

  // Trigger map resize when container changes (prevents grey bars & misalignment)
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 200); // slight delay lets layout settle
    }
  }, [showPreview]);

  return <div id="map" className="map-container" />;
};

export default LeafletMap;
