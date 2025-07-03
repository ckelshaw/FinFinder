import React, { useEffect, useState } from "react";
import mockConditions from "../MockConditions";
import placeholderMap from "../assets/placeholderImage.jpg";
import { savePlannedTrip } from "../api/trips";
import { fetchWeatherData } from "../api/weather";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import LeafletMap from "./LeafletMap";

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
  const [maxTemp, setMaxTemp] = useState("");
  const [minTemp, setMinTemp] = useState("");
  const [sunrise, setSunrise] = useState("");
  const [sunset, setSunset] = useState("");
  const [precipChance, setPrecipChance] = useState("");
  const [bPressure, setBPressure] = useState("");
  const [streamFlow, setStreamFlow] = useState("");
  const [wind, setWind] = useState("");
  const [windGusts, setWindGusts] = useState("");
  const [windDirection, setWindDirection] = useState("");
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
      maxTemp,
      minTemp,
      sunrise,
      sunset,
      precipChance,
      bPressure,
      streamFlow,
      siteCode: usgsSite.siteCode,
      siteName: usgsSite.siteName,
      latitude: usgsSite.latitude,
      longitude: usgsSite.longitude,
      wind,
      windGusts,
      windDirection,
    };
    console.log("Trip data:", tripData);

    savePlannedTrip(tripData) //method from src/api/trips.js
      .then(() => {
        console.log("Trip saved");
        navigate("/my-trips");
      })
      .catch((err) => {
        console.log("Failed to save trip:", err);
      });
  };

  const getWeatherData = async () => {
    try{
      const data = await fetchWeatherData(usgsSite.latitude, usgsSite.longitude, date, 'forecast');
      console.log("Weather data fetched successfully: ", data);
      setMaxTemp(data.maxTemp);
      setMinTemp(data.minTemp);
      setSunrise(data.sunrise);
      setSunset(data.sunset);
      setPrecipChance(data.precipitation);
      setBPressure(data.bPressure);
      setWind(data.windSpeed);
      setWindGusts(data.windGusts);
      setWindDirection(data.windDirection);
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
    }

  }

  useEffect(() => {
    console.log("lat", usgsSite);
    setStreamFlow(usgsSite.flow); //Getting the flow from the USGS data
    getWeatherData(); //Get the weather data for the selected river and date
  }, []);

  if(!windDirection) return <div>Loading...</div>;

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
                    <strong>High:</strong> {maxTemp}°F 
                    <strong> Low:</strong> {minTemp}°F
                  </p>
                  <p className="mb-1">
                    <strong>Wind Speed:</strong> {wind} mph {windDirection} 
                    <strong> Gusts:</strong> {windGusts} mph
                  </p>
                  <p className="mb-1">
                    <strong>Barometric Pressure:</strong> {bPressure}
                  </p>
                  <p className="mb-1">
                    <strong>Chance of Precipitation:</strong> {precipChance}%
                  </p>
                  <p className="mb-1">
                    <strong>Sunrise:</strong> {sunrise}
                  </p>
                  <p className="mb-1">
                    <strong>Sunset:</strong> {sunset}
                  </p>
                </div>

                {/* Right Column */}
                <div className="col-12 col-md-6 d-flex justify-content-center align-items-center" >
                  <LeafletMap site={usgsSite} />
                  {/* <img
                    src={placeholderMap}
                    alt="Map preview"
                    className="img-fluid rounded shadow-sm"
                    style={{
                      maxHeight: "250px",
                      objectFit: "cover",
                      width: "100%",
                    }}
                  /> */}
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
                  className="btn btn-outline-light rounded-pill px-4"
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
