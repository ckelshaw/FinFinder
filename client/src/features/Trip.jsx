import React, { useState, useEffect } from "react";
import { getTripById } from '../api/trips';
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import TripCard from '../components/TripCard';
import Navbar from "../components/Navbar";

function Trip() { //Page to display details of a specific trip

  const [trip, setTrip] = useState([]);
  // const [loading, setLoading] = useState(!trip);
  // const [error, setError] = useState(null);
  const { tripId } = useParams();
  const { user } = useUser();


  useEffect(() => {
    fetchTripDetails();
  }, [user, tripId]);

  const fetchTripDetails = async () => {
  if (!user) return;
  try {
    const data = await getTripById(tripId);
    setTrip(data);
  } catch (err) {
    console.error('Error fetching trip:', err);
  }
};

  if (!trip) return <p>Trip not found.</p>;

  return (
    <>
    <Navbar />
    <TripCard trip={trip} onTripUpdated={fetchTripDetails} />
    </>
  
  );
}

export default Trip;
