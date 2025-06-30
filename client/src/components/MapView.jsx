// import React, {useRef, useEffect} from 'react';
// import mapboxgl from 'mapbox-gl';
// import '../MapView.css';
// import 'mapbox-gl/dist/mapbox-gl.css';

// mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

// const MapView = ({ site, zoom = 16 }) => {
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const lat = +site.latitude;
//   const lng = +site.longitude;

//   console.log('site: ', site);

//   useEffect(() => {
//     if (map.current) return; // initialize map only once
//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: "mapbox://styles/mapbox/satellite-streets-v12",
//       center: [lng, lat],
//       zoom: zoom,
//     });

//     // Add zoom and rotation controls
//     map.current.addControl(new mapboxgl.NavigationControl());

//     //Create popup for site information
//     const popupContent = `
//     <div class="usgs-popup">
//       <h5>${site.siteName}</h5>
//       <p><strong>Site Code:</strong> ${site.siteCode}</p>
//       <p><strong>Flow:</strong> ${site.flow}</p>
//     </div>
//   `;

//     const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

//     new mapboxgl.Marker({ color: "#2c7a7b" }) // Use your theme color
//       .setLngLat([site.longitude, site.latitude])
//       .setPopup(popup)
//       .addTo(map.current);
//   }, []);

  

//   return <div ref={mapContainer} className="map-container" />;
// };

// export default MapView;