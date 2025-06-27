import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import placeholderMap from './Assets/placeholderImage.jpg'
import axios from "axios";
import TripCard from './components/TripCard';
import Navbar from "./Navbar";

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
    console.log(tripId)
        if(!user) return;

        //TODO: Move this to a backend call
        const { data, error } = await supabase
            .from('trip_details_view')
            .select('*')
            .eq('trip_id', tripId)
            .single();

        if(error) {
            console.error(error);
        } else {
            setTrip(data);
        }
    };

  const saveAsCompleted = () => { // Update trip status to completed in the database
    axios.post('/api/tripCompleted', {
        id: tripId,
        completed: true
    })
    .then(res => {
        console.log("trip updated");
        fetchTripDetails();
    })
    .catch(err => {
        console.log('failed to update the record')
    });
  }

  if (!trip) return <p>Trip not found.</p>;

  return (
    <>
    <Navbar />
    <TripCard trip={trip} onSaveCompleted={saveAsCompleted} onTripUpdated={fetchTripDetails} />
    </>
  
  );
}

export default Trip;
