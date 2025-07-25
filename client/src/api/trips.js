import api from './api';

// Fetch all trips for a given user
export const getTripsByUser = async (userId) => {
  const res = await api.get(`/trips/user/${userId}`);
  return res.data;
};

// Fetch a specific trip by its ID
export const getTripById = async (tripId) => {
  const res = await api.get(`/trips/${tripId}`);
  return res.data;
};

// Save a new fishing trip with weather/conditions
export const savePlannedTrip = async (tripData) => {
  const response = await api.post('/trips', tripData);
  return response.data;
};

// Mark trip as completed
export const markTripAsCompleted = async ({ id, user_id }) => {
  const res = await api.patch('/trips/mark-as-completed', { id, completed: true, user_id });
  return res.data;
};

// Update post-trip notes
export const updatePostTripNotes = async ({ id, post_trip_notes, user_id }) => {
  const res = await api.patch('/trips/update-post-trip-notes', { id, post_trip_notes, user_id });
  return res.data;
};

// Update trip's streamflow data
export const updateTripStreamflow = async ({ id, stream_flow, user_id }) => {
  const res = await api.patch('/trips/update-trip', { id, stream_flow, user_id });
  return res.data;
};

//Update a trips rating
export const updateTripRating = async ({ id, rating, user_id }) => {
  console.log("made it to trips.js");
  const res = await api.patch('/trips/update-trip-rating', {id, rating, user_id});
  console.log("called api");
  return res.data;
}

// Update a trip's weather data
export const updateTripWeather = async ({
  id,
  barometric_pressure,
  wind_mph,
  max_temp,
  min_temp,
  sunrise,
  sunset,
  wind_gust,
  wind_direction,
  actual_precipitation,
  user_id,
}) => {
  console.log("trips.js id:", id);
  const res = await api.patch("/trips/update-weather", {
    id,
    barometric_pressure,
    wind_mph,
    max_temp,
    min_temp,
    sunrise,
    sunset,
    wind_gust,
    wind_direction,
    actual_precipitation,
    user_id,
  });
  return res.data;
};

//Save Photos to a trip
export const uploadTripPhotos = async (photoMetadata, tripId, token, onProgress) => {
  const formData = new FormData();
  const metadata = [];

  photoMetadata.forEach((item) => {
    formData.append("photos", item.file); // Attach file
    metadata.push({
      spotId: item.spotId || null,
    });
  });

  formData.append("metadata", JSON.stringify(metadata));

  const res = await api.post(`/trips/${tripId}/upload-photo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if(onProgress) onProgress(percent);
    }
  });
  return res.data;
};

//Get Photos by Trip ID
export const getTripPhotos = async (tripId) => {
  const res = await api.get(`/trips/${tripId}/photos`);
  console.log(res.data);
  return res.data;
};
