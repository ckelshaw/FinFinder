// components/TripDetailsCard.jsx
import React, { useState } from 'react';
import placeholderMap from '../assets/placeholderImage.jpg';
import {
  markTripAsCompleted,
  updatePostTripNotes as apiUpdatePostTripNotes,
  updateTripStreamflow,
  updateTripWeather as apiUpdateTripWeather
} from '../api/trips';
import { fetchHistoricalUSGSData } from '../api/rivers';
import { fetchWeatherData } from '../api/weather';
import { useUser } from '@clerk/clerk-react';
import LeafletMap from './LeafletMap';

function TripCard({ trip, onTripUpdated, usgsSiteLatLong }) {
  const [postTripNotes, setPostTripNotes] = useState('');
  const { user } = useUser();
  const userId = user?.id;
  const [updatedUSGSData, setUpdatedUSGSData] = useState(null);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);

  const saveAsCompleted = () => { //Update the trip as completed
    markTripAsCompleted({ id: trip.trip_id, user_id: userId })
    .then(res => {
        console.log("trip updated!", res.data)
        onTripUpdated(); //Callback function to Trip.jsx
    })
    .catch(err => {
      console.log('Failed to complete update: ', err)
    })
  }

  const updatePostTripNotes = (pTripNotes) => { //Update the trip with the post-trip notes
    apiUpdatePostTripNotes({
      id: trip.trip_id,
      post_trip_notes: postTripNotes,
      user_id: userId,
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
    updateTripStreamflow({
      id: trip.trip_id,
      stream_flow: usgsData?.[0]?.flow,
      user_id: userId,
    })
      .then((res) => {
        console.log("trip updated with USGS data!", res);
        onTripUpdated(); //Callback function to Trip.jsx
      })
      .catch((err) => {
        console.log("Failed to complete update: ", err);
      });
  }

  const updateTripWeather = (weatherData) =>{ //Update the trip with the new USGS data
    console.log("Updating trip with weather data:", weatherData);
    apiUpdateTripWeather({
      id: trip.trip_id,
      barometric_pressure: weatherData?.bPressure,
      wind_mph: weatherData?.windSpeed,
      max_temp: weatherData?.maxTemp,
      min_temp: weatherData?.minTemp,
      sunrise: weatherData?.sunrise,
      sunset: weatherData?.sunset,
      wind_gust: weatherData?.windGusts,
      wind_direction: weatherData?.windDirection,
      actual_precipitation: weatherData?.precipitation,
      user_id: userId,
    })
      .then((res) => {
        console.log("trip updated with Weather data!", res);
        onTripUpdated(); //Callback function to Trip.jsx
      })
      .catch((err) => {
        console.log("Failed to complete update: ", err);
      });
  }

  //Call to USGS to get streamflow for the day of the trip and weather api for historical weather data. Previous value was for the current conditions on the day the trip was created.
  const fetchRealData = async () => { 
    setIsLoadingRealData(true);
    try {
      const streamflowData = await fetchHistoricalUSGSData({
        riverName: trip.river_name,
        siteCode: trip.usgs_site_code,
        date: trip.date
    });
    console.log("Fetched USGS data:", streamflowData);
    setUpdatedUSGSData(streamflowData); 
    await updateTrip(streamflowData); //Call our function to update the trip with the new data

    // Fetch historical weather data
    console.log(trip);
    const weatherData = await fetchWeatherData(trip.latitude, trip.longitude, trip.date, 'historical');
    console.log("Fetched weather data:", weatherData);
    await updateTripWeather(weatherData);

    //onTripUpdated(); //Callback function to Trip.jsx

    } catch (err) {
      console.log("Failed to fetch historical data: ", err);
    } finally {
      setIsLoadingRealData(false);
    }
  };
  

  if (!trip || !usgsSiteLatLong.latitude) return <h1>Loading...</h1>;

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
                    <strong>High:</strong> {trip.max_temp}°F 
                    <strong> Low:</strong> {trip.min_temp}°F
                  </p>
                  <p className="mb-1">
                    <strong>Wind Speed:</strong> {trip.wind_mph} mph {trip.wind_direction} 
                    <strong> Gusts:</strong> {trip.wind_gust} mph
                  </p>
                  <p className="mb-1">
                    <strong>Barometric Pressure:</strong> {trip.barometric_pressure} 
                  </p>
                  {trip.actual_precipitation == null ? (
                  <p className="mb-1">
                    <strong>Chance of Precipitation:</strong> {trip.precipitation_chance}%
                  </p>
                  ) : (
                  <p className="mb-1">
                    <strong>Precipitation:</strong> {trip.actual_precipitation} in.
                  </p>
                  )}
                  <p className="mb-1">
                    <strong>Sunrise:</strong> {trip.sunrise}
                  </p>
                  <p className="mb-1">
                    <strong>Sunset:</strong> {trip.sunset}
                  </p>
              </div>

              {/* Right Column */}
              <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                {trip.usgs_site_code ? (
                  <LeafletMap site={usgsSiteLatLong} />
                ) : (
                  <p className="text-warning">No USGS site data available</p>
                )
                }         
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
                  {isLoadingRealData ? 'Updating Trip Data...' : 'Fetch Actual Data for Trip'}
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