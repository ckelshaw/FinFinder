import React, {useState, useEffect} from "react";
import Navbar from "../components/Navbar";
import { getTripsByUser } from '../api/trips';
import { useUser } from "@clerk/clerk-react";
import { Navigate, useNavigate } from "react-router-dom";
import TripRating from "../components/TripRating";

function MyTrips(){ //Page to display user's planned and completed trips
    const { user } = useUser();
    const [plannedTrips, setPlannedTrips] = useState([]);
    const [completedTrips, setCompletedTrips] = useState([]);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

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
          <h5 className="card-title white">{trip.title}</h5>
          <p className="card-text white">
            <strong>Date:</strong> {trip.date}<br />
            <strong>Pre-Trip Notes:</strong> {trip.pre_trip_notes || '—'} <br />
            <strong>Post-Trip Notes:</strong> {trip.post_trip_notes || '—'}
          </p>
          {trip.completed && (
            <TripRating trip={trip} userId={user?.id} readOnly={true} />
          )}
          <p className="white text-muted small mb-0">
            Created at: {new Date(trip.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );

  const filteredPlannedTrips = plannedTrips.filter((trip) => trip.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCompletedTrips = completedTrips.filter((trip) => trip.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <h2 className="text-center mb-4">My Trips</h2>
        <div className="mb-4 text-center">
          <input
            type="text"
            className="form-control w-50 mx-auto"
            placeholder="Search by river name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <h4 className="orange mb-3">Planned Trips</h4>
        <div className="row">
          {filteredPlannedTrips.length ? (
            filteredPlannedTrips.map(renderTripCard)
          ) : (
            <p className="text-muted">No planned trips found.</p>
          )}
        </div>

        <h4 className="text-success mt-5 mb-3">Completed Trips</h4>
        <div className="row">
          {filteredCompletedTrips.length ? (
            filteredCompletedTrips.map(renderTripCard)
          ) : (
            <p className="text-muted">No completed trips found.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default MyTrips;