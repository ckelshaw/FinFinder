import React, { useEffect, useState } from "react";
import mockConditions from "../MockConditions";
import placeholderMap from "../assets/placeholderImage.jpg";
import { savePlannedTrip } from "../api/trips";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

function FishingConditions({
  riverName,
  riverId,
  date,
  title,
  onClear,
  usgsSite,
}) {
  const { user } = useUser();
  const userId = user?.id;
  const [temp, setTemp] = useState("");
  const [bPressure, setBPressure] = useState("");
  const [streamFlow, setStreamFlow] = useState("");
  const [wind, setWind] = useState("");
  const [preTripNotes, setPreTripNotes] = useState("");
  const navigate = useNavigate();

  const saveFishingTrip = () => {
    const tripData = {
      user_id: userId,
      river_id: riverId,
      river_name: riverName,
      state: "ID",
      date,
      title,
      preTripNotes,
      temp,
      bPressure,
      streamFlow,
      siteCode: usgsSite.siteCode,
      siteName: usgsSite.siteName,
      wind,
    };

    savePlannedTrip(tripData) //method from src/api/trips.js
      .then(() => {
        console.log("Trip saved");
        navigate("/my-trips");
      })
      .catch((err) => {
        console.log("Failed to save trip:", err);
      });
  };

  useEffect(() => {
    console.log(usgsSite);
    //Loading our mock data
    setTemp(mockConditions.temp);
    setBPressure(mockConditions.barometric_pressure);
    //setStreamFlow(mockConditions.stream_flow)
    setStreamFlow(usgsSite.flow); //Getting the flow from the USGS data
    setWind(mockConditions.wind_mph);
  }, []);

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card shadow-sm p-4 mt-4">
              <h4 className="text-center mb-4">Conditions</h4>
              <div className="row">
                {/* Left Column */}
                <div className="col-12 col-md-6 mb-4 mb-md-0">
                  <h5 className="mb-3">
                    {riverName} on {date}
                  </h5>
                  <p className="mb-2">
                    <strong>Stream Flow:</strong> {streamFlow} cfs
                  </p>
                  <p className="mb-2 small">{usgsSite.siteName}</p>
                  <h6 className="mt-4 mb-2">Forecast</h6>
                  <p className="mb-1">
                    <strong>Temperature:</strong> {temp}°F
                  </p>
                  <p className="mb-1">
                    <strong>Wind Speed:</strong> {wind} mph
                  </p>
                  <p className="mb-1">
                    <strong>Barometric Pressure:</strong> {bPressure}
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
                <textarea
                  id="preTripNotes"
                  className="form-control"
                  rows="4"
                  placeholder="Add any thoughts, plans, or gear notes here..."
                  value={preTripNotes}
                  onChange={(e) => setPreTripNotes(e.target.value)}
                ></textarea>
              </div>
              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={saveFishingTrip}
                >
                  Save as a Planned Trip!
                </button>
                <button
                  className="btn btn-outline-secondary rounded-pill px-4"
                  type="button"
                  onClick={onClear}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FishingConditions;
