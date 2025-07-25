import supabase from '../../supabaseClient.js';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

// Helper to check trip ownership
const verifyTripOwnership = async (tripId, userId) => {
  const { data: trip, error } = await supabase
    .from('fishing_trip')
    .select('user_id')
    .eq('id', tripId)
    .single();

  if (error) throw error;
  if (!trip || trip.user_id !== userId) {
    const ownershipError = new Error('Unauthorized access to trip.');
    ownershipError.statusCode = 403;
    throw ownershipError;
  }
};

// Get Trips by User
export const getTripsByUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('fishing_trip')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching trips:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get Trip by trip ID
export const getTripById = async (req, res) => {
  const { trip_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('trip_details_view') // Using the DB view
      .select('*')
      .eq('trip_id', trip_id)
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching trip:', err.message);
    res.status(500).json({ error: err.message });
  }
};

//Create Trip + Conditions + Fishing Spot
export const createTrip = async (req, res) => {
  const {
    user_id,
    river_id,
    river_name,
    state,
    date,
    title,
    preTripNotes,
    postTripNotes,
    completed = false,
    rating = null,
    maxTemp = 0,
    minTemp = 0,
    sunrise = null,
    sunset = null,
    precipChance = 0,
    bPressure = 0,
    streamFlow = 0,
    siteCode = '',
    siteName = '',
    latitude = 0,
    longitude = 0,
    wind = 0,
    windGusts = 0,
    windDirection = '',
    last_fetched = new Date().toISOString().split('T')[0],
    fishingSpots = []
  } = req.body;

  try {
    console.log("body", req.body);
    // Make sure river exists
    let finalRiverId = river_id;

    const { data: existingRiver, error: riverError } = await supabase
      .from("rivers")
      .select("id")
      .eq("id", river_id)
      .single();

    if (riverError && riverError.code !== 'PGRST116') throw riverError;

    if (!existingRiver) {
      const { data: newRiver, error: insertError } = await supabase
        .from("rivers")
        .insert([{ id: river_id, river_name, state }])
        .select()
        .single();

      if (insertError) throw insertError;
      finalRiverId = newRiver.id;
    }

    // Call the stored procedure
    const { data: insertedTripId, error: tripInsertError } = await supabase.rpc(
      'insert_full_trip',
      {
        p_user_id: user_id,
        p_river_id: finalRiverId,
        p_date: date,
        p_title: title,
        p_pre_trip_notes: preTripNotes,
        p_post_trip_notes: postTripNotes,
        p_completed: completed,
        p_rating: rating,
        p_max_temp: maxTemp,
        p_min_temp: minTemp,
        p_barometric_pressure: bPressure,
        p_stream_flow: streamFlow,
        p_wind_mph: wind,
        p_usgs_site_code: siteCode,
        p_usgs_site_name: siteName,
        p_latitude: latitude,
        p_longitude: longitude,
        p_sunrise: sunrise,
        p_sunset: sunset,
        p_precipitation_chance: precipChance,
        p_wind_gust: windGusts,
        p_wind_direction: windDirection,
        p_actual_precipitation: 0, // default for now
        p_last_fetched: last_fetched,
        p_spots: fishingSpots || []
      }
    );

    if (tripInsertError) throw tripInsertError;

    res.status(201).json({
      message: 'Trip, conditions, and spots saved',
      trip_id: insertedTripId
    });

  } catch (err) {
    console.error("Failed to create trip:", err);
    res.status(500).json({ error: err.message });
  }
};

export const uploadTripPhotos = async (req, res) => {
  const userId = req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized — Clerk token missing or invalid.' });
  }

  const { tripId } = req.params;
  const files = req.files;
  const metadata = JSON.parse(req.body.metadata || '[]');

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No photos uploaded.' });
  }

  try {
    const insertedPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const spotId = metadata[i]?.spotId || null;
      const ext = file.originalname.split('.').pop();
      const path = `trip_${tripId}/${Date.now()}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-photos')
        .upload(path, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw uploadError;

      const { publicUrl } = supabase.storage
        .from('trip-photos')
        .getPublicUrl(path).data;

      const insertResult = await supabase
        .from('trip_photos')
        .insert([
          {
            trip_id: tripId,
            spot_id: spotId,
            user_id: userId,
            photo_url: publicUrl,
            caption: '',
          },
        ])
        .select();

      insertedPhotos.push(insertResult.data?.[0]);
    }

    res.status(201).json({ message: 'Photos uploaded', photos: insertedPhotos });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
};

//Get Trip Photos
export const getTripPhotos = async (req, res) => {
  const { tripId } = req.params;

  try {
    const { data, error } = await supabase
      .from('trip_photos')
      .select('*')
      .eq('trip_id', tripId);
    
      if(error) throw error;

      res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching photos:', err);
    res.status(500).json({ error: 'Failed to fetch trip photos' });
  }
};

// Mark Trip as Completed
export const markTripAsCompleted = async (req, res) => {
  const { id, completed, user_id } = req.body;

  try {
    await verifyTripOwnership(id, user_id);

    const { data, error } = await supabase
      .from('fishing_trip')
      .update({ completed })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Trip marked as completed.', data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

//  Update streamflow conditions
export const updateTripStreamFlow = async (req, res) => {
  const { id, stream_flow, user_id } = req.body;

  try {
    await verifyTripOwnership(id, user_id);

    const now = new Date();
    const dateOnly = now.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('conditions')
      .update({ stream_flow, last_fetched: dateOnly })
      .eq('trip_id', id)
      .select();

    if (error) throw error;

    res.status(200).json({ message: 'Trip streamflow updated.', data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

//  Update post-trip notes
export const updatePostTripNotes = async (req, res) => {
  const { id, post_trip_notes, user_id } = req.body;

  try {
    await verifyTripOwnership(id, user_id);

    const { data, error } = await supabase
      .from('fishing_trip')
      .update({ post_trip_notes })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Post-trip notes updated.', data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

//Update a trips rating
export const updateTripRating = async (req, res) => {
  const { id, rating, user_id } = req.body;

  try {
    await verifyTripOwnership(id, user_id);

    const { data, error } = await supabase
      .from('fishing_trip')
      .update({ rating })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'rating updated.', data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

// Update trip's weather conditions
export const updateTripWeather = async (req, res) => {
  const { 
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
    user_id
  } = req.body;
console.log("request body: ",req.body);
  try {
    console.log('id:', id)
    console.log('user id:', user_id)
    await verifyTripOwnership(id, user_id);

    const now = new Date();
    const dateOnly = now.toISOString().split('T')[0];

console.log("Updating weather conditions for trip: ", req.body);
    const { data, error } = await supabase
      .from('conditions')
      .update({ 
        barometric_pressure,
        wind_mph,
        max_temp,
        min_temp,
        sunrise,
        sunset,
        wind_gust,
        wind_direction,
        actual_precipitation,
        last_fetched: dateOnly
       })
      .eq('trip_id', id)
      .select();

    if (error) throw error;
    console.log("Weather conditions updated successfully for trip: ", data);

    res.status(200).json({ message: 'Trip streamflow updated.', data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};