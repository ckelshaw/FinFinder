// components/TripDetailsCard.jsx
import React, { useState, useEffect } from 'react';
import {
  markTripAsCompleted,
  updatePostTripNotes as apiUpdatePostTripNotes,
  updateTripStreamflow,
  updateTripWeather as apiUpdateTripWeather,
  uploadTripPhotos as apiUploadPhotos,
  getTripPhotos
} from '../api/trips';
import { fetchHistoricalUSGSData } from '../api/rivers';
import { fetchHistoricalWeatherData } from '../api/weather';
import { useUser } from '@clerk/clerk-react';
import LeafletMap from './LeafletMap';
import FishingConditions from './FishingConditions';
import TripRating from './TripRating';
import { format } from 'date-fns';
import UploadPhotoModal from './UploadPhotoModal';
import { useAuth } from '@clerk/clerk-react';
import TripPhotoCarousel from './TripPhotoCarousel';


function TripCard({ trip, onTripUpdated, usgsSiteLatLong, fishingSpots }) {
  const [postTripNotes, setPostTripNotes] = useState('');
  const [focusedSpot, setFocusedSpot] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [tripPhotos, setTripPhotos] = useState([]);
  const [photoRefreshSignal, setPhotoRefreshSignal] = useState(0);
  const { user } = useUser();
  const userId = user?.id;
  const { getToken } = useAuth();
  const selectedSite = {
    latitude: trip.latitude,
    longitude: trip.longitude,
    siteName: trip.usgs_site_name,
    siteCode: trip.usgs_site_code,
    flow: trip.stream_flow,
  };

  const today = format(new Date(), 'yyy-MM-dd');

  const uploadPhotos = () => {
    setShowUploadModal(true);
  }

  const handleUpload = async (photoMetadata, onProgress) => {
    const token = await getToken();
    apiUploadPhotos(photoMetadata, trip.trip_id, token, onProgress)
      .then((res) => {
        console.log("Photos uploaded: ", res.data);
        setPhotoRefreshSignal(prev => prev + 1); //rerender photo carousel
        onTripUpdated();
    })
    .catch((err) => {
      console.log("Unable to upload photos: ", err);
    });
  }

  useEffect(() => {
    getTripPhotos(trip.trip_id)
      .then((photos) => setTripPhotos(photos))
      .catch((err) => console.error("Failed to fetch trip photos: ", err));
  }, [trip.trip_id]);

  useEffect(() => {
    const tripLastFetched = format(new Date(), 'yyy-MM-dd');
    if (tripLastFetched < today && !trip.completed) {
      const fetchAndUpdate = async () => {
        //If the conditions have not been updated since the user viewed the trip and it is still a planned trip
        try {
          const data = await fetchHistoricalData();
          await updateTripFlow(data.weather);
          await updateTripWeather(data.streamflow);
        } catch (err) {
          console.log("Failed to update trip with most up to date data: ", err);
        }
      };
      fetchAndUpdate();
    }
  }, []); 

    const fetchHistoricalData = async () => {
      //const tripDate = format(new Date(trip.date), 'yyy-MM-dd');
      const weatherType = trip.date >= today ? 'forecast' : 'archive'; //If the planned date is after/the day of then get the forecast
      try {
        // Run both requests in parallel
        const [weatherData, streamflowData] = await Promise.all([
          fetchHistoricalWeatherData(
            trip.latitude,
            trip.longitude,
            trip.date,
            weatherType
          ),
          fetchHistoricalUSGSData({
            riverName: trip.river_name,
            siteCode: trip.usgs_site_code,
            date: trip.date,
          }),
        ]);

        // Combine and return both
        return {
          weather: weatherData,
          streamflow: streamflowData[0],
        };
      } catch (err) {
        console.error("Error fetching historical data:", err);
        return null;
      }
    };

  const saveAsCompleted = async () => {
    //Get the historical streamflow and weather data and update the trip as completed
    const updatedData = await fetchHistoricalData();
    const formattedWeatherData = {
      id: trip.trip_id,
      barometric_pressure: updatedData.weather.bPressure,
      wind_mph: updatedData.weather.windSpeed,
      max_temp: updatedData.weather.maxTemp,
      min_temp: updatedData.weather.minTemp,
      sunrise: updatedData.weather.sunrise,
      sunset: updatedData.weather.sunset,
      wind_gust: updatedData.weather.windGusts,
      wind_direction: updatedData.weather.windDirection,
      actual_precipitation: updatedData.weather.precipitation,
      user_id: userId
    }
    apiUpdateTripWeather(formattedWeatherData)
      .then((res) => {
        console.log("weather updated: ", res.data)
    })
    .catch((err) => {
      console.log("Failed to update weather: ", err);
    });

    const formattedStreamFlowData = {
      id: trip.trip_id,
      stream_flow: updatedData.streamflow.flow,
      user_id: userId
    }
    updateTripStreamflow(formattedStreamFlowData)
      .then((res) => {
        console.log("streamflow updated: ", res.data)
    })
    .catch((err) => {
      console.log("Failed to update streamflow: ", err);
    });
    
    markTripAsCompleted({ id: trip.trip_id, user_id: userId })
      .then((res) => {
        console.log("trip updated!", res.data);
        onTripUpdated(); //Callback function to Trip.jsx
      })
      .catch((err) => {
        console.log("Failed to complete update: ", err);
      });
  };

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

  const updateTripFlow = (usgsData) =>{ //Update the trip with the new USGS data
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

  const selectSpot = (spot) => {
    setFocusedSpot(spot);
  }

  if (!trip || !usgsSiteLatLong.latitude) return <h1>Loading...</h1>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-12">
          <div className="card shadow-lg p-4">
            <h2 className="text-center mb-4">{trip.title}</h2>
            <div className="row">
              {/* Left Column */}
              <div className="col-12 col-md-6 mb-4 mb-md-0">
                <FishingConditions
                  trip={trip}
                  riverName={trip.river_name}
                  riverId={trip.river_id}
                  date={trip.date}
                  title={trip.title}
                  streamFlow={trip.stream_flow}
                  usgsSite={selectedSite}
                  showSaveBtn={false}
                  fishingSpots={fishingSpots}
                  selectedSpot={selectSpot}
                />
                <div className="d-flex justify-content-center mb-4">
                  <label
                    htmlFor="preTripNotes"
                    className="form-label fs-6 fw-semibold white text-center justify-content-center"
                  >
                    Pre-Trip Notes
                  </label>
                  <p className="white">{`: ${trip.pre_trip_notes}`}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                {trip.usgs_site_code ? (
                  <LeafletMap
                    fishingSpots={fishingSpots}
                    selectedSite={selectedSite}
                    showButton={false}
                    focusedSpot={focusedSpot}
                  />
                ) : (
                  <p className="text-warning">No USGS site data available</p>
                )}
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
            <TripPhotoCarousel tripId={trip.trip_id} refreshSignal={photoRefreshSignal} />
            {trip.completed && (
              <div className="mb-4">
                <label
                  htmlFor="postTripNotes"
                  className="form-label fs-6 fw-semibold orange"
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
            )}
            <div className="d-flex justify-content-between pt-2">
              {!trip.completed &&
                trip.date <= today && ( //Show the Save as Completed button if the trip is not completed and the trip date is today or in the past.
                  <button
                    type="button"
                    className="btn primary-button rounded-pill px-4"
                    onClick={saveAsCompleted}
                  >
                    Save as a Completed Trip!
                  </button>
                )}
              {trip.completed && (
                <TripRating
                  trip={trip}
                  userId={userId}
                  readOnly={false}
                ></TripRating>
              )}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={uploadPhotos}
                >
                  Upload Photos
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger rounded-pill px-4" //TODO: Add Delete later.
                >
                  Delete
                </button>
              </div>
              {showUploadModal && (
                <UploadPhotoModal
                  show={showUploadModal}
                  onClose={() => setShowUploadModal(false)}
                  onUpload={handleUpload}
                  fishingSpots={fishingSpots}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripCard;