// components/TripDetailsCard.jsx
import React, { useState } from 'react';
import placeholderMap from '../Assets/placeholderImage.jpg';
import axios from "axios";
import { useUser } from '@clerk/clerk-react';

function TripCard({ trip, onSaveCompleted, onTripUpdated }) {

  const [postTripNotes, setPostTripNotes] = useState('');
  const { user } = useUser();
  const userId = user?.id;
  const [updatedUSGSData, setUpdatedUSGSData] = useState(null);

  const saveAsCompleted = () => { //Update the trip as completed
    axios.patch('/api/trip/mark-as-completed', {
        id: trip.trip_id,
        completed: true,
        user_id: userId
    })
    .then(res => {
        console.log("trip updated!", res.data)
        onTripUpdated(); //Callback function to Trip.jsx
    })
    .catch(err => {
      console.log('Failed to complete update: ', err)
    })
  }

  const updatePostTripNotes = (pTripNotes) => { //Update the trip with the post-trip notes
    axios.patch('/api/trip/update-post-trip-notes', {
        id: trip.trip_id,
        post_trip_notes: postTripNotes,
        user_id: userId
    })
    .then(res => {
        console.log("trip notes updated!", res.data)
        onTripUpdated(); //Callback function to Trip.jsx
    })
    .catch(err => {
      console.log('Failed to complete update: ', err)
    })
  }

  const updateTrip = (usgsData) =>{ //Update the trip with the new USGS data
    axios
      .patch("/api/trip/update-trip", {
        id: trip.trip_id,
        stream_flow: usgsData[0].flow,
        user_id: userId,
      })
      .then((res) => {
        console.log("trip updated with USGS data!", res.data);
        onTripUpdated(); //Callback function to Trip.jsx
      })
      .catch((err) => {
        console.log("Failed to complete update: ", err);
      });
  }

  const fetchRealData = () => { //Call to USGS to get streamflow for the day of the trip. Previous value was for the current conditions on the day the trip was created.
    axios
      .get("/api/search-usgs", {
        params: {
          stateCd: "ID", //TODO: get the state from the selected river in the future
          siteType: "ST", //Searches for only stream/river sites
          parameterCd: "00060", //Searches for only gauging stations
          siteStatus: "active", //Filter out inactive sites
          format: "json",
          riverName: trip.river_name, //Pass in the river name to have our fuzzy match against gauging stations
          siteCode: trip.usgs_site_code, //Pass in the siteCode to search for a specific site
          startDate: trip.date, //Pass in the date of the trip
          endDate: trip.date, //Pass in the date of the trip (same as above as we want the data for that day)
        },
      })
      .then((res) => {
        console.log("Fetched USGS updated data", res.data);
        setUpdatedUSGSData(res.data);
        updateTrip(res.data); //Call our function to update the trip with the new data
      })
      .catch((err) => {
        console.log("Failed to pull USGS updated data: ", err);
      });
  };
  

  if (!trip) return null;

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm p-4 mt-4">
            <h4 className="text-center mb-4">{trip.title}</h4>
            <div className="row">
              {/* Left Column */}
              <div className="col-12 col-md-6 mb-4 mb-md-0">
                <h5 className="mb-3">
                  {trip.river_name} on {trip.date}
                </h5>
                <p className="mb-2">
                  <strong>Stream Flow:</strong> {trip.stream_flow} cfs
                </p>
                <h6 className="mt-4 mb-2">Forecast</h6>
                <p className="mb-1">
                  <strong>Temperature:</strong> {trip.temp}°F
                </p>
                <p className="mb-1">
                  <strong>Wind Speed:</strong> {trip.wind_mph} mph
                </p>
                <p className="mb-1">
                  <strong>Barometric Pressure:</strong>{" "}
                  {trip.barometric_pressure}
                </p>
              </div>

              {/* Right Column */}
              <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                <img
                  src={placeholderMap}
                  alt="Map preview"
                  className="img-fluid rounded shadow-sm"
                  style={{
                    maxHeight: "250px",
                    objectFit: "cover",
                    width: "100%",
                  }}
                />
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="preTripNotes"
                className="form-label fs-6 fw-semibold"
              >
                Pre-Trip Notes
              </label>
              <p className="card-text">{trip.pre_trip_notes}</p>
            </div>
            {trip.completed && 
              <div className="mb-4">
                <label
                  htmlFor="postTripNotes"
                  className="form-label fs-6 fw-semibold"
                >
                  Post-Trip Notes
                </label>
                <textarea
                  id="postTripNotes"
                  className="form-control"
                  rows="4"
                  placeholder="Add any notes on your trip here..."
                  value={trip.post_trip_notes}
                  onChange={(e) => setPostTripNotes(e.target.value)}
                  onBlur={updatePostTripNotes}
                ></textarea>
              </div>
            }
            <div className="d-flex justify-content-between">
              {!trip.completed && ( //Show the Save as Completed button if the trip is not completed.
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={saveAsCompleted}
                >
                  Save as a Completed Trip!
                </button>
              )}
              {trip.completed && ( //Show the Fetch actual data for date button if the trip is completed.
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={fetchRealData}
                >
                  Fetch actual data for trip
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline-danger rounded-pill px-4" //TODO: Add Delete later.
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripCard;