import React, { useEffect, useState } from "react";
import mockConditions from "../MockConditions";
import placeholderMap from "../assets/placeholderImage.jpg";
import { savePlannedTrip } from "../api/trips";
import { fetchWeatherData } from "../api/weather";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "./FishingConditions.scss";
import WeatherForecast from "./WeatherForecast";

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
    try {
      const data = await fetchWeatherData(
        usgsSite.latitude,
        usgsSite.longitude,
        date,
        "forecast"
      );
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
      console.error("Failed to fetch weather data:", err);
    }
  };

  useEffect(() => {
    console.log("lat", usgsSite);
    setStreamFlow(usgsSite.flow); //Getting the flow from the USGS data
    getWeatherData(); //Get the weather data for the selected river and date
  }, []);

  if (!windDirection) return <div>Loading...</div>;

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h4 className="text-center mb-4">
              Conditions for {riverName} on {date}
            </h4>

            {/* River Name and Flow Info */}
            <div className="mb-3 text-center">
              <h5 className="mb-1 streamFlow">
                <strong>Stream Flow:</strong> {streamFlow} cfs
              </h5>
              <p className="text-muted small">{usgsSite.siteName}</p>
            </div>

            {/* Weather Info */}
            <WeatherForecast
              maxTemp={maxTemp}
              minTemp={minTemp}
              wind={wind}
              windDirection={windDirection}
              windGusts={windGusts}
              precipChance={precipChance}
              bPressure={bPressure}
              sunrise={sunrise}
              sunset={sunset}
            />

            {/* Notes */}
            <div className="mt-4">
              <label htmlFor="preTripNotes" className="form-label fw-semibold">
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

            {/* Buttons */}
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
    </>
  );
}

export default FishingConditions;
