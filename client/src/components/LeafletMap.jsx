// src/components/LeafletMap.jsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "../MapView.css";

const LeafletMap = ({
  sites = [],
  selectedSite,
  zoom = 18,
  onSiteSelect,
  showPreview,
  showButton,
  onAddFishingSpot,
  isAddingSpot,
  fishingSpots,
  focusedSpot,
}) => {
  // Fallback to default if site is missing or doesn't have lat/lng
  const defaultLat = 44.047313;
  const defaultLng = -114.191688;

  const lat = sites[0]?.latitude ? +sites[0].latitude : defaultLat;
  const lng = sites[0]?.longitude ? +sites[0].longitude : defaultLng;
  zoom = sites[0]?.latitude ? 18 : 6;

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const spotMarkersRef = useRef([]);

  const spotIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
    const validSites = displaySites.filter(
      (site) => site.latitude && site.longitude
    );

    validSites.forEach((site) => {
      const lat = parseFloat(site.latitude);
      const lng = parseFloat(site.longitude);

      const marker = L.marker([lat, lng]).addTo(mapRef.current);
      marker.bindPopup(`
      <div class="usgs-popup">
        <h5>${site.siteName}</h5>
        <p><strong>Site Code:</strong> ${site.siteCode}</p>
        <p><strong>Flow:</strong> ${site.flow} cfs</p>
        ${
          showButton
            ? `<button class="btn primary-button select-site-btn">Select</button>`
            : ""
        }
      </div>
    `);
      if (showButton) {
        //Only add the button if we are in the trip planning page
        marker.on("popupopen", (e) => {
          const popupEl = e.popup.getElement();
          const button = popupEl.querySelector(".select-site-btn");

          if (button) {
            button.addEventListener("click", () => {
              onSiteSelect(site);
              marker.closePopup();
              button.style.display = "none";
            });
          }
        });
      }
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

  //Give the user the ability to click on the map and add a fishing spot
  useEffect(() => {
    if(!mapRef.current || !isAddingSpot) return;

    const map = mapRef.current;

    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      const name = prompt("Enter a name for this fishing spot: ");
      if(name){
        onAddFishingSpot({ lat, lng, name })
      }
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [isAddingSpot]);

  //Render the fishing spots
  useEffect(() => {
  if (!mapRef.current || !fishingSpots?.length) return;

  // Remove old fishing spot markers
  spotMarkersRef.current.forEach(marker => mapRef.current.removeLayer(marker));
  spotMarkersRef.current = [];

  // Add new fishing spot markers
  fishingSpots.forEach((spot) => {
    const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon })
      .addTo(mapRef.current)
      .bindPopup(`<strong>${spot.name}</strong>`);
    spotMarkersRef.current.push(marker);
  });
}, [fishingSpots]);

//Cetner the map on the selected Fishing Spot
useEffect(() => {
  if (focusedSpot && mapRef.current && spotMarkersRef.current.length > 0) {
    const { lat, lng, name } = focusedSpot;

    // Center the map
    mapRef.current.setView([lat, lng], 16);

    // Find and open the matching marker's popup
    const matchingMarker = spotMarkersRef.current.find((marker) => {
      const {lat: markerLat, lng: markerLng} = marker.getLatLng();
      return (
        parseFloat(markerLat).toFixed(5) === parseFloat(lat).toFixed(5) &&
        parseFloat(markerLng).toFixed(5) === parseFloat(lng).toFixed(5)
      );
    });

    if (matchingMarker) {
      matchingMarker.openPopup();
    }
  }
}, [focusedSpot]);
 
  return <div id="map" className="map-container" />;
};

export default LeafletMap;
