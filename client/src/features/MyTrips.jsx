import React, {useState, useEffect} from "react";
import Navbar from "../components/Navbar";
import { getTripsByUser } from '../api/trips';
import { useUser } from "@clerk/clerk-react";
import { Navigate, useNavigate } from "react-router-dom";

function MyTrips(){ //Page to display user's planned and completed trips
    const { user } = useUser();
    const [plannedTrips, setPlannedTrips] = useState([]);
    const [completedTrips, setCompletedTrips] = useState([]);
    const navigate = useNavigate();

    const handleCardClick = (trip) => { //If a user clicks on a trip card, navigate to the trip details page
        navigate(`/trip/${trip.id}`, { state: { trip }});
    }

    useEffect(() => {
        if(user){
            fetchTrips();
        }
    },[user]);

    // Fetch user's trips when component mounts or user changes
    const fetchTrips = async () => {
      try {
        const trips = await getTripsByUser(user.id);
        const pTrips = trips.filter((trip) => !trip.completed);
        const cTrips = trips.filter((trip) => trip.completed);
        setPlannedTrips(pTrips);
        setCompletedTrips(cTrips);
      } catch (err) {
        console.error("Error fetching trips:", err);
      }
    };


    const renderTripCard = (trip) => (
    <div key={trip.id} className="col-sm-12 col-md-6 col-lg-4 mb-4" onClick={() => handleCardClick(trip)} style={{ cursor: 'pointer'}}>
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-primary">{trip.title}</h5>
          <p className="card-text">
            <strong>Date:</strong> {trip.date}<br />
            <strong>Pre-Trip Notes:</strong> {trip.pre_trip_notes || '—'} <br />
            <strong>Post-Trip Notes:</strong> {trip.post_trip_notes || '—'}
          </p>
          <p className="text-muted small mb-0">
            Created at: {new Date(trip.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <h2 className="text-primary text-center mb-4">My Trips</h2>

        <h4 className="text-warning mb-3">Planned Trips</h4>
        <div className="row">
          {plannedTrips.length ? plannedTrips.map(renderTripCard) : (
            <p className="text-muted">No planned trips yet.</p>
          )}
        </div>

        <h4 className="text-success mt-5 mb-3">Completed Trips</h4>
        <div className="row">
          {completedTrips.length ? completedTrips.map(renderTripCard) : (
            <p className="text-muted">No completed trips yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default MyTrips;