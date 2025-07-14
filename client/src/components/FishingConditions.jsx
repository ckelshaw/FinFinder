import React, { useEffect, useState } from "react";
import { savePlannedTrip } from "../api/trips";
import { fetchWeatherData } from "../api/weather";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "./FishingConditions.scss";
import WeatherForecast from "./WeatherForecast";

function FishingConditions({
  trip,
  riverName,
  riverId,
  date,
  title,
  onClear,
  usgsSite,
  showSaveBtn,
  tripCreation,
  fishingSpots,
  selectedSpot,
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

  //Old method of saving trip
  // const saveFishingTrip = () => {
  //   const today = new Date().toISOString().split('T')[0];
  //   const tripData = {
  //     user_id: userId,
  //     river_id: riverId,
  //     river_name: riverName,
  //     state: "ID", //TODO: get the state from the user
  //     date,
  //     title,
  //     preTripNotes,
  //     maxTemp,
  //     minTemp,
  //     sunrise,
  //     sunset,
  //     precipChance,
  //     bPressure,
  //     streamFlow,
  //     siteCode: usgsSite.siteCode,
  //     siteName: usgsSite.siteName,
  //     latitude: usgsSite.latitude,
  //     longitude: usgsSite.longitude,
  //     wind,
  //     windGusts,
  //     windDirection,
  //     last_fetched: today,
  //   };
  //   console.log("Trip data:", tripData);

  //   savePlannedTrip(tripData) //method from src/api/trips.js
  //     .then(() => {
  //       console.log("Trip saved");
  //       navigate("/my-trips");
  //     })
  //     .catch((err) => {
  //       console.log("Failed to save trip:", err);
  //     });
  // };

  //New method of saving trip with sproc
  const saveFishingTrip = () => {
  const today = new Date().toISOString().split('T')[0];

  const tripData = {
    user_id: userId,
    river_id: riverId,
    river_name: riverName,
    state: "ID", // TODO: eventually get this from the user

    date,
    title,
    preTripNotes,
    postTripNotes: null,
    completed: false,
    rating: null,

    maxTemp,
    minTemp,
    sunrise,
    sunset,
    precipChance,
    bPressure,
    streamFlow,

    siteCode: usgsSite?.siteCode || '',
    siteName: usgsSite?.siteName || '',
    latitude: usgsSite?.latitude || 0,
    longitude: usgsSite?.longitude || 0,
    wind,
    windGusts,
    windDirection,

    last_fetched: today,

    fishingSpots // This should be an array of { name, lat, lng }
  };

  console.log("Trip data being saved:", tripData);

  savePlannedTrip(tripData)
    .then(() => {
      console.log("Trip saved");
      navigate("/my-trips");
    })
    .catch((err) => {
      console.error("Failed to save trip:", err);
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


  // const fetchStreamflowData = async () => {
  //   try {
  //         const streamflowData = await fetchHistoricalUSGSData({
  //           riverName: trip.river_name,
  //           siteCode: trip.usgs_site_code,
  //           date: trip.date
  //       });
  //       console.log("Fetched USGS data:", streamflowData);
  // } catch (err) {
  //   console.log("Failed to fetch streamflow data: ", err);
  // }

  useEffect(() => {
    console.log("Show fishing conditions", tripCreation);
    if(tripCreation){
      setStreamFlow(usgsSite.flow); //Getting the flow from the USGS data
      getWeatherData(); //Get the weather data for the selected river and date
    } else {
      setStreamFlow(trip.stream_flow);
    }

  }, []);
  if ((tripCreation && !windDirection) || (!tripCreation && !trip)) return <div>Loading...</div>;

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h2 className="text-center mb-4">
              Conditions for {riverName} on{" "}
              <span className="orange">{date} </span>
            </h2>

            {/* River Name and Flow Info */}
            <div className="d-flex justify-content-center mb-4">
              <div className="streamflow-badge-wrapper text-center justify-content-center">
                <h3 className="mb-1 streamFlow white">
                  <strong className="orange">STREAM FLOW:</strong> <br />{" "}
                  {streamFlow} cfs
                </h3>
                <p className="small mb-0 white">{usgsSite.siteName}</p>
              </div>
            </div>

            {/* Weather Info */}
            {tripCreation ? ( //If creating the trip we wont have the trip data yet
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
            ) : (
              <WeatherForecast
                maxTemp={trip.max_temp}
                minTemp={trip.min_temp}
                wind={trip.wind_mph}
                windDirection={trip.wind_direction}
                windGusts={trip.wind_gust}
                precipChance={trip.precipitation_chance}
                actualPrecipitation={trip.actual_precipitation}
                bPressure={trip.barometric_pressure}
                sunrise={trip.sunrise}
                sunset={trip.sunset}
              />
            )}

            {/* Notes */}
            {showSaveBtn && (
              <div className="mt-2">
                <label
                  htmlFor="preTripNotes"
                  className="form-label fw-semibold white"
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
            )}
            {fishingSpots.length > 0 && (
              <div className="d-flex justify-content-center mt-2">
                <div className="text-center justify-content-center">
                  <h5 className="streamFlow white">
                    <strong className="orange">Fishing Spots:</strong> <br />
                      <div className="fishing-spot-list">
                      {fishingSpots.map((spot, index) => (
                        <span key={index}
                          onClick={() => selectedSpot(spot)}
                        >
                          {spot.name}{index < fishingSpots.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                      </div>
                  </h5>
                </div>
              </div>
            )}
            {/* Buttons */}
            {showSaveBtn && ( //Only show the save as a planned trip button if the date of the trip is today or in the past
              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn primary-button rounded-pill px-4"
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FishingConditions;
