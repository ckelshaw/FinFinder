import express from 'express';
import supabase from '../../supabaseClient.js';

const router = express.Router();

// Endpoint to create a new trip, with conditions for the trip
router.post('/', async (req, res) => {
  const {
    user_id,
    river_id,      // This comes from GNIS and is unique
    river_name,
    state,    
    date,
    title,
    preTripNotes,
    temp,
    bPressure,
    streamFlow,
    siteCode,
    siteName,
    wind
  } = req.body;

  try {
    // STEP 0: Ensure the river exists in the rivers table
    let finalRiverId = river_id;

    const { data: existingRiver, error: riverCheckError } = await supabase
      .from('rivers')
      .select('id')
      .eq('id', river_id)
      .single();

    if (riverCheckError && riverCheckError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw riverCheckError;
    }

    if (!existingRiver) {
      // If river not found, insert it
      const { data: newRiver, error: riverInsertError } = await supabase
        .from('rivers')
        .insert([{ id: river_id, river_name: river_name, state: state }])
        .select()
        .single();

      if (riverInsertError) throw riverInsertError;

      finalRiverId = newRiver.id;
    }

    // STEP 1: Insert fishing trip
    const { data: tripData, error: tripError } = await supabase
      .from('fishing_trip')
      .insert([
        {
          user_id,
          river: finalRiverId,
          date,
          title,
          pre_trip_notes: preTripNotes
        }
      ])
      .select();

    if (tripError) throw tripError;

    const trip_id = tripData[0].id;

    // STEP 2: Insert conditions
    const { data: conditionsData, error: conditionsError } = await supabase
      .from('conditions')
      .insert([
        {
          trip_id,
          temp,
          barometric_pressure: bPressure,
          stream_flow: streamFlow,
          usgs_site_code: siteCode,
          usgs_site_name: siteName,
          wind_mph: wind
        }
      ])
      .select();

    if (conditionsError) throw conditionsError;

    res.status(201).json({
      message: 'Trip and conditions saved',
      trip: tripData[0],
      conditions: conditionsData[0]
    });

  } catch (error) {
    console.error('Insert error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;