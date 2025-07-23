import React, { useState, useEffect } from "react";
import { getTripById } from '../api/trips';
import { fetchSpotForTrip } from '../api/spots';
import { fetchUSGSLatLong } from "../api/rivers";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import TripCard from '../components/TripCard';
import Navbar from "../components/Navbar";

function Trip() { //Page to display details of a specific trip

  const [trip, setTrip] = useState(null);
  const [fishingSpots, setFishingSpots] = useState([]);
  const { tripId } = useParams();
  const { user } = useUser();
  const [usgsLatLong, setUSGSLatLong] = useState([]);

  useEffect(() => {
    if (user) {
      fetchTripDetails();
    }
  }, [user, tripId]);

  const fetchTripDetails = async () => {
  //if (!user) return;
  try {
    const data = await getTripById(tripId); //Pull the trip details
    setTrip(data);
    console.log('Trip fetched:', data);
    if(data.usgs_site_code) {
    const siteInfo = await fetchUSGSLatLong(data.usgs_site_code); // Fetch the USGS Lat/Long for the monitoring site the user had selected
    setUSGSLatLong({
      siteCode: data.usgs_site_code,
      siteName: siteInfo.siteName,
      siteType: siteInfo.siteType,
      latitude: siteInfo.latitude,
      longitude: siteInfo.longitude,
      flow: data.stream_flow
    });
    const spotData = await fetchSpotForTrip(tripId);
    const normalizedSpots = spotData.map((spot) => ({ //Our DB stores lat and lng as latitude longitude. Leaflet expects lat lng.
      ...spot,
      lat: spot.lat ?? spot.latitude,
      lng: spot.lng ?? spot.longitude,
    }));
    setFishingSpots(normalizedSpots);
    console.log("Fishing Spots: ", normalizedSpots);
  }
  } catch (err) {
    console.error('Error fetching trip:', err);
  }
};
  if (!trip) return <p>Loading trip...</p>;

  return (
    <>
    <Navbar />
    <TripCard trip={trip} onTripUpdated={fetchTripDetails} usgsSiteLatLong={usgsLatLong} fishingSpots={fishingSpots} />
    </>
  
  );
}

export default Trip;
