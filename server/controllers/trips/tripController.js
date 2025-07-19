import supabase from '../../supabaseClient.js';

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

// Create Trip + Conditions
// export const createTrip = async (req, res) => {
//   const {
//     user_id,
//     river_id, //From GNIS and unique
//     river_name,
//     state,
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
//     siteCode,
//     siteName,
//     latitude,
//     longitude,
//     wind,
//     windGusts,
//     windDirection,
//     last_fetched
//   } = req.body;

//   try {
//     let finalRiverId = river_id;

//     // Check if river exists
//     const { data: existingRiver, error: riverCheckError } = await supabase
//       .from('rivers')
//       .select('id')
//       .eq('id', river_id)
//       .single();

//     if (riverCheckError && riverCheckError.code !== 'PGRST116') throw riverCheckError; // PGRST116 means no rows returned

//     if (!existingRiver) { //If river not found, insert it
//       const { data: newRiver, error: riverInsertError } = await supabase
//         .from('rivers')
//         .insert([{ id: river_id, river_name, state }])
//         .select()
//         .single();
//       if (riverInsertError) throw riverInsertError;

//       finalRiverId = newRiver.id;
//     }

//     const { data: tripData, error: tripError } = await supabase
//       .from('fishing_trip')
//       .insert([
//         {
//           user_id,
//           river: finalRiverId,
//           date,
//           title,
//           pre_trip_notes: preTripNotes
//         }
//       ])
//       .select();

//     if (tripError) throw tripError;

//     const trip_id = tripData[0].id;

//     // Insert Conditions
//     const { data: conditionsData, error: conditionsError } = await supabase
//       .from('conditions')
//       .insert([
//         {
//           trip_id,
//           max_temp: maxTemp,
//           min_temp: minTemp,
//           sunrise,
//           sunset,
//           precipitation_chance: precipChance,
//           barometric_pressure: bPressure,
//           stream_flow: streamFlow,
//           usgs_site_code: siteCode,
//           usgs_site_name: siteName,
//           latitude: latitude,
//           longitude: longitude,
//           wind_mph: wind,
//           wind_gust: windGusts,
//           wind_direction: windDirection,
//           last_fetched: last_fetched
//         }
//       ])
//       .select();

//     if (conditionsError) throw conditionsError;

//     res.status(201).json({
//       message: 'Trip and conditions saved',
//       trip: tripData[0],
//       conditions: conditionsData[0]
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

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